var greenToRed = function (pos) {
  var max = 255
  var r = pos >= 0.5 ? max : 2 * pos * max
  var g = pos <= 0.5 ? max : (max - ((pos - 0.5) * 2 * max))
  var b = 0
  return "rgb(" + r + "," + g + "," + b + ")"
}

var bft_to_kmh = function (bft) {
  return Math.pow(bft, 1.5) * 3.010
}

function degToBg(degrees) { return degrees * Math.PI / 180; }
function tan(degrees) { return Math.tan(degToBg(degrees)) }




ctx = document.getElementById('canvasInAPerfectWorld').getContext("2d");
// ***** data begin
var bftMax = 13
var kmhMax = 140
// ***** data end

class Area {
  constructor(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.width = right - left;
    this.height = bottom - top;
  }

  newInnerArea(deltaLeft, deltaTop, deltaRight, deltaBottom) {
    return new Area(this.left + deltaLeft, this.top + deltaTop, this.right - deltaRight, this.bottom - deltaBottom)
  }
  setColor(color) {
    ctx.strokeStyle = color;
  }

  fill(color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.left, this.top, this.width, this.height);
  }

  drawLine(left, top, toRight, toBottom) {
    ctx.beginPath();
    ctx.moveTo(this.left + left, this.top + top);
    ctx.lineTo(this.left + left + toRight, this.top + top + toBottom);
    ctx.stroke()
  }

  printText(text, x, y, color, font, align) {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.font = font;
    ctx.fillText(text, this.left + x, this.top + y);
  }

  forEachX(applier) { // applier -> function(x, xPercent), wobei x relativ zum aktuellen frame, percent --> Wer zwischen 0 und 1
    for (var x = 0; x < this.width; x++) {
      applier(x, (1 + x) / this.width)
    }
  }
}

// ***** fill background
var total = new Area(0, 0, ctx.canvas.width, ctx.canvas.height)
total.fill("white")

// ***** start drawing
var chartArea = total.newInnerArea(50, 50, 50, 50)


// ***** Außenmaße
var treppeBreite = 90
var treppeLaenge = 220



// ***************************
// ***** Treppe **************
// http://trepedia.de/entwerfen/treppenverziehung/winkelmethode/

function line(x1, y1, x2, y2, color) {
  var faktor = 4
  chartArea.setColor(color)

  var _x1 = x1 * faktor
  var _y1 = treppeLaenge * faktor - y1 * faktor
  var _x2 = x2 * faktor
  var _y2 = treppeLaenge * faktor - y2 * faktor
  chartArea.drawLine(_x1, _y1, _x2 - _x1, _y2 - _y1)

}



// ************* Rahmen
line(0, 0, treppeBreite, 0, "black") // unten
line(0, 0, 0, treppeLaenge, "black") // links
line(0, treppeLaenge, treppeBreite, treppeLaenge, "black") // oben
line(treppeBreite, 0, treppeBreite, treppeLaenge, "black") // rechts


// ***** Treppe manuell
// var cL = treppeLaenge
// var cR = treppeLaenge
// var middlePointX = treppeBreite / 2
// var middlePointY = (cL + cR) / 2


// *********** SHOW LOGIK **********
var showOnly = new URLSearchParams(window.location.search).get("stufe")
if (!showOnly) showOnly = 0
if (showOnly < 0) location.href = "?stufe=0"
if (showOnly > 11) location.href = "?stufe=11"

document.addEventListener('keyup', (e) => {
  if (e.code === "ArrowDown") location.href = "?stufe=" + (showOnly - 1)
  else if (e.code === "ArrowUp") location.href = "?stufe=" + (showOnly - 1 + 2)
});

// ************ DATEN ************
var alt_beginnArr = [0, 20, 39.7, 59.5, 79.1, 98.7, 118.4, 138, 157.4, 176.5, 196]
var alt_endeArr = [23.3, 43, 63, 82.8, 102.4, 122.2, 141.8, 161.4, 180.6, 200, 219.2]

var neu_beginn = {
  l: [-45, -16.5, 12, 40.5, 69, 97.5, 126, 154.5, 186.5, 231.5, 331.5],
  r: [-5, 7.5, 20, 32.5, 45, 57.5, 70, 82.5, 95, 107.5, 120]
}







for (var i = 0; i < neu_beginn.l.length; i++) {

  var showAll = (showOnly < 1)
  if (!showAll && showOnly != i + 1) continue

  neu_beginn_l = neu_beginn.l[i]
  neu_beginn_r = neu_beginn.r[i]
  line(0, neu_beginn_l, treppeBreite, neu_beginn_r, "red")    // Neue Stufe

  alt_beginn = alt_beginnArr[i]
  alt_ende = alt_endeArr[i]
  line(0, alt_beginn, treppeBreite, alt_beginn, "yellow")
  line(0, alt_ende, treppeBreite, alt_ende, "yellow")
  if (!showAll) line(0, alt_ende, treppeBreite, alt_ende, "red")
  if (!showAll) line(0, alt_ende, treppeBreite, alt_beginn, "yellow")
  if (!showAll) line(0, alt_beginn, treppeBreite, alt_ende, "yellow")

  if (!showAll) line(0, neu_beginn_l, 0, alt_ende, "red")
  if (!showAll) line(treppeBreite, neu_beginn_r, treppeBreite, alt_ende, "red")

  console.log("====== Stufe " + (i + 1) + " ======")
  var _l = alt_ende - neu_beginn_l
  var _r = alt_ende - neu_beginn_r

  console.log("Links : " + _l.toFixed(1) + "   Rechts : " + _r.toFixed(1) + (_l < 0 ? "    ! Achtung Dreieck !" : ""))



  // cL = treppeLaenge - dL
  // cR = treppeLaenge - dR



  // // draw middle line
  // if (cL > 0) {
  //   var newMiddlePointX = treppeBreite / 2 // TODO recalculate
  //   var newMiddlePointY = (cL + cR) / 2
  // } else {
  //   var x2 = treppeBreite / ((-cL / cR) + 1)
  //   var x1 = treppeBreite - x2

  //   var newMiddlePointX = x2 / 2 + x1
  //   var newMiddlePointY = cR / 2
  // }

  // chartArea.setColor("lightPink")
  // chartArea.drawLine(middlePointX, middlePointY, newMiddlePointX - middlePointX, newMiddlePointY - middlePointY)

  // var distance = Math.sqrt(
  //   (newMiddlePointX - middlePointX) * (newMiddlePointX - middlePointX)
  //   +
  //   (newMiddlePointY - middlePointY) * (newMiddlePointY - middlePointY)
  // ) / faktor

  // console.log("==== Stufe " + (i + 1) + " =====")
  // console.log("original von: ")
  // console.log("original bis: ")

  // if (i > 0)
  //   console.log("Mittel Stufe " + (i) + ": " + distance)
  // middlePointX = newMiddlePointX
  // middlePointY = newMiddlePointY
}

// var newMiddlePointX = treppeBreite
// var newMiddlePointY = cR / 2

// chartArea.setColor("lightPink")
// chartArea.drawLine(middlePointX, middlePointY, newMiddlePointX - middlePointX, newMiddlePointY - middlePointY)

// var distance = Math.sqrt(
//   (newMiddlePointX - middlePointX) * (newMiddlePointX - middlePointX)
//   +
//   (newMiddlePointY - middlePointY) * (newMiddlePointY - middlePointY)
// ) / faktor

// var breiteStufe11 = (treppeLaenge / faktor) - (r[10])
// console.log("Mittel Stufe 11: " + distance + "   .... Breite: " + breiteStufe11)


var whiteArea = total.newInnerArea(0, 0, 0, total.height - 50)
whiteArea.fill("white")



ctx.stroke()

