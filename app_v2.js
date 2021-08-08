class Movable {
  constructor(bottom, left) {
    this.element = document.createElement("div");

    this.element.style.bottom = bottom + "%";
    this.element.style.left = left + "%";
  }

  set bottom(value) {
    this.element.style.bottom = value + "%";
  }

  set left(value) {
    this.element.style.left = value + "%";
  }

  get bottom() {
    return Number(
      this.element.style.bottom.substring(
        0,
        this.element.style.bottom.length - 1
      )
    );
  }

  get left() {
    return Number(
      this.element.style.left.substring(0, this.element.style.left.length - 1)
    );
  }
}

class Platform extends Movable {
  constructor(bottom) {
    super(bottom, Math.random() * 80);
    this.element.classList.add("platform");
  }
}

class Doodler extends Movable {
  constructor(bottom, left) {
    super(bottom, left);
    this.jumping = false;
    this.movingLeft = false;
    this.movingRight = false;

    this.element.classList.add("doodler");
  }
}

class App {
  constructor() {
    this.grid = document.querySelector(".grid");
    this.doodler;
    this.startPoint;
    this.platformCount = 5;
    this.platforms = [];
    this.score = 0;
    this.loopTimeId;
  }

  createDoodler = () => {
    this.doodler = new Doodler(
      this.platforms[0].bottom,
      this.platforms[0].left
    );
    this.doodler.jumping = true;
    this.grid.appendChild(this.doodler.element);
  };

  initializePlatforms = () => {
    const platformGap = 100 / this.platformCount;
    for (let i = 0; i < this.platformCount; i++) {
      let newPlatBottom = 16.6 + i * platformGap;
      this.createPlatform(newPlatBottom);
    }
  };

  createPlatform = (bottom) => {
    const platform = new Platform(bottom);
    this.grid.appendChild(platform.element);
    this.platforms.push(platform);
  };

  movePlatforms = () => {
    if (this.doodler.bottom > 30) {
      this.platforms.forEach((platform) => {
        platform.bottom -= 0.5;
      });
    }
    if (this.platforms[0].bottom < -1.7) {
      let firstPlatform = this.platforms.shift();
      this.grid.removeChild(firstPlatform.element);
      this.createPlatform(100);
      this.score += 1;
      this.grid.querySelector(".scoreboard span").textContent = this.score;
    }
  };

  mainLoop = () => {
    // Vertical movement
    if (this.doodler.jumping && this.doodler.bottom < this.startPoint + 33) {
      this.doodler.bottom += 2;
    } else {
      this.doodler.jumping = false;
      this.doodler.bottom -= 0.5;
    }

    // Should Doodler jump?
    if (!this.doodler.jumping) {
      // Check collision
      this.platforms.forEach((platform) => {
        if (
          this.doodler.bottom > platform.bottom &&
          this.doodler.bottom < platform.bottom + 2.5 &&
          this.doodler.left + 15 > platform.left &&
          this.doodler.left < platform.left + 20
        ) {
          this.sstartPoint = this.doodler.bottom;
          this.doodler.jumping = true;
        }
      });
    }

    // Horizontal movement
    if (this.doodler.movingLeft) {
      if (this.doodler.left < 0) {
        this.doodler.movingLeft = false;
        this.doodler.movingRight = true;
      } else {
        this.doodler.left -= 0.75;
        this.doodler.element.style.transform = "rotateY(180deg)";
      }
    } else if (this.doodler.movingRight) {
      if (this.doodler.left > 85) {
        this.doodler.movingRight = false;
        this.doodler.movingLeft = true;
      } else {
        this.doodler.left += 0.75;
        this.doodler.element.style.transform = "rotateY(0deg)";
      }
    }

    this.movePlatforms();

    // Game over
    if (this.doodler.bottom < 0) {
      clearInterval(this.loopTimeId);
      this.createStartPage("Restart");
    }
  };

  keyboardControl = (e) => {
    if (e.key === "ArrowLeft") {
      this.doodler.movingRight = false;
      this.doodler.movingLeft = true;
    } else if (e.key === "ArrowRight") {
      this.doodler.movingLeft = false;
      this.doodler.movingRight = true;
    } else if (e.key === "ArrowUp") {
      this.doodler.movingLeft = false;
      this.doodler.movingRight = false;
    }
  };

  touchControl = (e) => {
    const x = e.changedTouches[0].screenX;
    const screenWidth = document.querySelector("html").clientWidth;

    if (x / screenWidth < 0.5) {
      this.doodler.movingRight = false;
      this.doodler.movingLeft = true;
    } else {
      this.doodler.movingLeft = false;
      this.doodler.movingRight = true;
    }
  };

  run = () => {
    this.initializePlatforms();
    this.createDoodler();
    this.startPoint = this.doodler.bottom;
    document.addEventListener("keydown", this.keyboardControl);
    document.addEventListener("touchstart", this.touchControl);
    this.createStartPage("Play");
  };

  refreshPlatforms = () => {
    this.platforms.forEach((platform) => {
      this.grid.removeChild(platform.element);
    });
    this.platforms = [];
    this.initializePlatforms();
  };

  createStartPage = (btnText) => {
    const startPage = document.createElement("div");
    startPage.classList.add("start");
    this.grid.appendChild(startPage);
    startPage.innerHTML = `
      <ul>
      <li>Press ArrowLeft or tap the left-half of the screen to move left.</li>
      <li>Press ArrowRight or tap the right-half of the screen to move right.</li>
      <li>Press ArrowUp to move straight.</li>
      </ul>
      <button class='btn'>${btnText}</button>`;

    startPage.querySelector(".btn").addEventListener("click", () => {
      if (btnText == "Restart") {
        this.refreshPlatforms();

        // Reset the doodler's position and state
        this.doodler.bottom = this.platforms[0].bottom;
        this.doodler.left = this.platforms[0].left;
        this.doodler.jumping = true;
        this.doodler.movingLeft = false;
        this.doodler.movingRight = false;

        // Reset scoreboard
        this.score = 0;
        this.grid.querySelector(".scoreboard span").textContent = this.score;
      }
      this.loopTimeId = setInterval(this.mainLoop, 20);
      this.grid.removeChild(startPage);
    });
  };
}

const app = new App();
app.run();
