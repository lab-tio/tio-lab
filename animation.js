// --- p5.js Cellular Battlefield Animation ---
let tCells = [];
let cancerCells = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-background');
    
    // Create initial cells
    for (let i = 0; i < 15; i++) {
        tCells.push(new TCell(random(width), random(height)));
    }
    for (let i = 0; i < 20; i++) {
        cancerCells.push(new CancerCell(random(width), random(height)));
    }
}

function draw() {
    background('#051424');
    
    // Update and display cells
    for (let i = tCells.length - 1; i >= 0; i--) {
        tCells[i].update(cancerCells);
        tCells[i].display();
    }
    for (let i = cancerCells.length - 1; i >= 0; i--) {
        cancerCells[i].update();
        cancerCells[i].display();
        if (cancerCells[i].isDead()) {
            cancerCells.splice(i, 1);
            // Add a new cancer cell to maintain population
            cancerCells.push(new CancerCell(random(width), random(height)));
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// T-Cell Class
class TCell {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(0.3, 0.6));
        this.size = 12;
        this.color = color(100, 255, 100, 200); // Vibrant Green
        this.target = null;
    }

    update(targets) {
        if (this.target && !this.target.isDead()) {
            let dir = p5.Vector.sub(this.target.pos, this.pos);
            this.vel.lerp(dir.setMag(1), 0.1);
            this.pos.add(this.vel);
            
            let d = p5.Vector.dist(this.pos, this.target.pos);
            if (d < this.target.size / 2) {
                this.target.health -= 0.5; // Damage target
            }
        } else {
            this.target = null;
            this.vel.rotate(random(-0.1, 0.1));
            this.pos.add(this.vel);
            this.edges();

            let closestDist = Infinity;
            for (let target of targets) {
                let d = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y);
                if (d < 100 && d < closestDist) {
                    closestDist = d;
                    this.target = target;
                }
            }
        }
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        
        // Cell body
        noStroke();
        fill(this.color);
        ellipse(0, 0, this.size, this.size);
        
        // T-Cell Receptor (TCR)
        stroke(255, 255, 255, 200);
        strokeWeight(2);
        line(this.size / 2, 0, this.size / 2 + 4, 0);

        pop();
        
        // Attack animation
        if(this.target && p5.Vector.dist(this.pos, this.target.pos) < this.target.size / 2 + 5) {
            stroke(255, 100, 100, 150);
            strokeWeight(1);
            line(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y);
        }
    }

    edges() {
        if (this.pos.x > width + this.size) this.pos.x = -this.size;
        if (this.pos.x < -this.size) this.pos.x = width + this.size;
        if (this.pos.y > height + this.size) this.pos.y = -this.size;
        if (this.pos.y < -this.size) this.pos.y = height + this.size;
    }
}

// Cancer Cell Class
class CancerCell {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(0.1, 0.2));
        this.maxSize = random(25, 35);
        this.size = this.maxSize;
        this.color = color(200, 100, 150, 150); // More reddish-purple
        this.nucleusColor = color(80, 40, 100, 180); // Darker blue/purple
        this.health = 100;
        this.noiseOffset = random(1000);
    }

    update() {
        this.pos.add(this.vel);
        this.edges();
        this.size = map(this.health, 0, 100, 10, this.maxSize);
    }

    display() {
        noStroke();
        
        // Cell body (irregular shape)
        fill(this.color);
        beginShape();
        let angleStep = TWO_PI / 15;
        for (let a = 0; a < TWO_PI; a += angleStep) {
            let offset = map(noise(this.noiseOffset + cos(a) * 2, this.noiseOffset + sin(a) * 2), 0, 1, -this.size * 0.2, this.size * 0.2);
            let r = this.size / 2 + offset;
            let x = this.pos.x + r * cos(a);
            let y = this.pos.y + r * sin(a);
            curveVertex(x, y);
        }
        endShape(CLOSE);

        // Large, dark nucleus
        fill(this.nucleusColor);
        ellipse(this.pos.x, this.pos.y, this.size * 0.6);

        this.noiseOffset += 0.01;
    }

    isDead() {
        return this.health <= 0;
    }

    edges() {
        if (this.pos.x > width + this.size) this.pos.x = -this.size;
        if (this.pos.x < -this.size) this.pos.x = width + this.size;
        if (this.pos.y > height + this.size) this.pos.y = -this.size;
        if (this.pos.y < -this.size) this.pos.y = height + this.size;
    }
}
