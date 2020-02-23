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
var treppeBreite = 78
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
line(0, 0, treppeBreite, 0, "grey") // unten
line(0, 0, 0, treppeLaenge, "grey") // links
line(0, treppeLaenge, treppeBreite, treppeLaenge, "grey") // oben
line(treppeBreite, 0, treppeBreite, treppeLaenge, "grey") // rechts


// *********** SHOW LOGIK **********
var showOnly = new URLSearchParams(window.location.search).get("stufe")
if (!showOnly) showOnly = 0
if (showOnly < 0) location.href = "?stufe=0"
if (showOnly > 11) location.href = "?stufe=11"

document.addEventListener('keyup', (e) => {
  if (e.code === "ArrowDown") location.href = "?stufe=" + (showOnly - 1)
  else if (e.code === "ArrowUp") location.href = "?stufe=" + (showOnly - 1 + 2)
  else if (e.code === "Escape") location.href = "?stufe=0"
});

// ************ DATEN ************
var alt_beginnArr = [0, 20, 39.7, 59.5, 79.1, 98.7, 118.4, 138, 157.4, 176.5, 196]
var alt_endeArr = [23.3, 43, 63, 82.8, 102.4, 122.2, 141.8, 161.4, 180.6, 200, 219.2]

var neu_beginn = {
  l: [-45, -16.5, 12, 40.5, 69, 97.5, 126, 154.5, 186.5, 231.5, 331.5],
  r: [-5, 7.5, 20, 32.5, 45, 57.5, 70, 82.5, 95, 107.5, 120]
}

for (var i = 0; i < neu_beginn.l.length; i++) {

  // ********* Skip - Logik
  var showAll = (showOnly < 1)
  if (!showAll && showOnly != i + 1) continue


  // ********* Zeichen - neue Stufe
  neu_beginn_l = neu_beginn.l[i]
  neu_beginn_r = neu_beginn.r[i]
  line(0, neu_beginn_l, treppeBreite, neu_beginn_r, "red")    // Neue Stufe


  // ********* Zeichen - alte Stufe
  alt_beginn = alt_beginnArr[i]
  alt_ende = alt_endeArr[i]
  line(0, alt_beginn, treppeBreite, alt_beginn, "yellow")
  line(0, alt_ende, treppeBreite, alt_ende, "yellow")
  if (!showAll) line(0, alt_ende, treppeBreite, alt_ende, "red")
  if (!showAll) line(0, alt_ende, treppeBreite, alt_beginn, "yellow")
  if (!showAll) line(0, alt_beginn, treppeBreite, alt_ende, "yellow")

  if (!showAll) line(0, neu_beginn_l, 0, alt_ende, "red")
  if (!showAll) line(treppeBreite, neu_beginn_r, treppeBreite, alt_ende, "red")


  // ********* Ausgabe der Werte
  console.log("====== Stufe " + (i + 1) + " ======")
  var _l = alt_ende - neu_beginn_l
  var _r = alt_ende - neu_beginn_r
  var _a = (_l + _r) / 2 * treppeBreite / 10000

  console.log("Links : " + _l.toFixed(1) + "   Rechts : " + _r.toFixed(1) + "        " + (_l < 0 ? "! Achtung Dreieck !" : "Fläche : " + _a.toFixed(3) + "m²"))


  // ********* Mittlere Tiefe
  if (i >= 8) continue

  /** liefert Mittelpunkt vom Stufenbeginn (x,y) für Stufe i */
  var calculateXY = function (ii) {
    var __l = neu_beginn.l[ii]
    var __r = neu_beginn.r[ii]
    if (__l < treppeLaenge) {
      return {
        x: treppeBreite / 2,
        y: (__l + __r) / 2
      }
    } else {
      var x2 = treppeBreite / ((-__l / __r) + 1)
      var x1 = treppeBreite - x2

      return {
        x: x2 / 2 + x1,
        y: __r / 2
      }
    }
  }


  var middleBeginn = calculateXY(i)
  var middleEnd = calculateXY(i + 1)

  line(middleBeginn.x, middleBeginn.y, middleEnd.x, middleEnd.y, "lightgreen")
  if (!showAll) line(middleBeginn.x, middleBeginn.y, middleEnd.x, middleEnd.y, "green")
  if (!showAll) line(0, neu_beginn.l[i + 1], treppeBreite, neu_beginn.r[i + 1], "lightgreen")    // Neue Stufe

  var distance = Math.sqrt(
    (middleEnd.x - middleBeginn.x) * (middleEnd.x - middleBeginn.x)
    +
    (middleEnd.y - middleBeginn.y) * (middleEnd.y - middleBeginn.y)
  )

  console.log("Tiefe im Mittel " + (i) + ": " + distance)
}


var whiteArea = total.newInnerArea(0, 0, 0, total.height - 50)
whiteArea.fill("white")



ctx.stroke()

