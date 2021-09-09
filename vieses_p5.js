let img = [];
let w = 80;
let maxImages = 18;
let imageIndex = 0;

let yoff = 0.0;
let yi = 0;

let state = 0;

// It's possible to convolve the image with many different
// matrices to produce different effects. This is a high-pass
// filter; it accentuates the edges.
const matrix = [ [ -1, -1, -1 ],
  [ -1, 9, -1 ],
  [ -1, -1, -1 ] ];

function preload() {
  for (let i = 0; i < maxImages; i ++ ) {
    img[i] = loadImage('data/bienal' + i + '.jpg' );
    //e varia às mãos de quem o joga.
  }
}

function setup() {
  createCanvas(900, 600);
  for (let i = 0; i < maxImages; i ++ ) {
    img[i].loadPixels();
    //e varia às mãos de quem o joga.
  }

  imageIndex = int(random(maxImages));

  // pixelDensity(1) for not scaling pixel density to display density
  // for more information, check the reference of pixelDensity()
  pixelDensity(1);

  noCursor();
}

function draw() {
  // We're only going to process a portion of the image
  // so let's set the whole image as the background first
  image(img[imageIndex], 0, 0);

  //Nunca um rio se banha em ti duas vezes
  if (state == 0) {
    //image(img[imageIndex],0,0);
    //não se destingue do seu interior
    noStroke();

    yi++;
    if (yi > height) {
      yi = 0;
    }
    //mas dele parte se vê
    fill(00, 102, 153, 80);

    // pois te mergulha
    beginShape();

    let xoff = 0; // Option #1: 2D Noise
    // let xoff = yoff; // Option #2: 1D Noise

    // Iterate over horizontal pixels
    for (let x = 0; x <= width; x += 10) {
      // Calculate a y value according to noise, map to

      // Option #1: 2D Noise
      let y = map(noise(xoff, yoff), 0, 1, 280, mouseY);

      // Option #2: 1D Noise
      // let y = map(noise(xoff), 0, 1, 200,300);

      // Set the vertex
      vertex(x, y);
      // Increment x dimension for noise
      xoff += 0.05;
    }
    // increment y dimension for noise
    yoff += 0.01;
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
  }

  if (state == 1) {
    // Calculate the small rectangle we will process
    const xstart = constrain(mouseX - w/2, 0, img[imageIndex].width);
    const ystart = constrain(mouseY - w/2, 0, img[imageIndex].height);
    const xend = constrain(mouseX + w/2, 0, img[imageIndex].width);
    const yend = constrain(mouseY + w/2, 0, img[imageIndex].height);
    const matrixsize = 3;

    loadPixels();
    // Begin our loop for every pixel in the smaller image
    for (let x = xstart; x < xend; x++) {
      for (let y = ystart; y < yend; y++ ) {
        let c = convolution(x, y, matrix, matrixsize, img);

        // retrieve the RGBA values from c and update pixels()
        let loc = (x + y*img[imageIndex].width) * 4;
        pixels[loc] = red(c);
        pixels[loc + 1] = green(c);
        pixels[loc + 2] = blue(c);
        pixels[loc + 3] = alpha(c);
      }
    }
    updatePixels();
  }
  // O vestígio vísivel passou a encontrado.
  if (state == 2) {
    //O seu fogo tem quantos vermelhos?
    let r = map(mouseX, 0, width, 0, 255);
    //A sua folha quantas imagens caduca?
    let g = map(mouseY, 0, height, 0, 255);
    //Porque janela as observas?

    let d = dist(mouseX, mouseY, width/2, height/2);

    //Nós não sabemos com que tinta elas te vêm
    let b = map(d, 0, width/2, 0, 255);
    //porque a Natureza nos inspirou nas cores.
    tint(r, g, b);
  } else {
    tint(255);
  }
  
  if(state == 3){
    loadPixels();
    // We must also call loadPixels() on the PImage since we are going to read its pixels.
    img[imageIndex].loadPixels();
    for (let x = 0; x < img[imageIndex].width; x++) {
        for (let y = 0; y < img[imageIndex].height; y++ ) {
        // Calculate the 1D location from a 2D grid
        let loc = (x + y*img[imageIndex].width)*4;
        // Get the R,G,B values from image
        let r,g,b;
        r = img[imageIndex].pixels[loc];
        // g = img.pixels[loc+1];
        // b = img.pixels[loc+2];
        // Calculate an amount to change brightness based on proximity to the mouse
        // The closer the pixel is to the mouse, the lower the value of "distance"
        let maxdist = 50;//dist(0,0,width,height);
        let d = dist(x, y, mouseX, mouseY);
        let adjustbrightness = 255*(maxdist-d)/maxdist;
        r += adjustbrightness;
        // g += adjustbrightness;
        // b += adjustbrightness;
        // Constrain RGB to make sure they are within 0-255 color range
        r = constrain(r, 0, 255);
        // g = constrain(g, 0, 255);
        // b = constrain(b, 0, 255);
        // Make a new color and set pixel in the window
        let pixloc = (y*width + x)*4;
        pixels[pixloc] = r;
        pixels[pixloc+1] = r;
        pixels[pixloc+2] = r;
        pixels[pixloc+3] = 255; // Always have to set alpha
        }
    }
    updatePixels();
  }
}

//Escreveste um episódio de uma história viesa.
function mouseReleased() {
  //A forma sempre é a mesma, mas a sua aparência revela-se única.
  imageIndex = int(random(maxImages));
  state++;
  //Ela repeta-se e nós também. Também.
  if (state >= 4) {
    state = 0;
  }
  //Deixaste o teu rasto. Guarda-o.
  saveFrames("save/f#####.png");
}

function convolution(x, y, matrix, matrixsize, img) {
  let rtotal = 0.0;
  let gtotal = 0.0;
  let btotal = 0.0;
  const offset = Math.floor(matrixsize / 2);
  for (let i = 0; i < matrixsize; i++) {
    for (let j = 0; j < matrixsize; j++) {

      // What pixel are we testing
      const xloc = (x + i - offset);
      const yloc = (y + j - offset);
      let loc = (xloc + img[imageIndex].width * yloc) * 4;

      // Make sure we haven't walked off our image, we could do better here
      loc = constrain(loc, 0, img[imageIndex].pixels.length - 1);

      // Calculate the convolution
      // retrieve RGB values
      rtotal += (img[imageIndex].pixels[loc]) * matrix[i][j];
      gtotal += (img[imageIndex].pixels[loc + 1]) * matrix[i][j];
      btotal += (img[imageIndex].pixels[loc + 2]) * matrix[i][j];
    }
  }
  // Make sure RGB is within range
  rtotal = constrain(rtotal, 0, 255);
  gtotal = constrain(gtotal, 0, 255);
  btotal = constrain(btotal, 0, 255);

  // Return the resulting color
  return color(rtotal, gtotal, btotal);
}
