/**
 * Created by gumm on 2016/01/12.
 */

goog.module('bad.layout.shapesNames');


/**
  * @type {
  *     {basic: !string,
  *     sample_1: !string,
  *     sample_2: !string,
  *     horiz: !string,
  *     vert: !string}}
 */
const shapeNames = {
  'basic': `
+-----------------------------------------------+
|                   head (72)                   |
+-----------------------------------------------+
|                     main                      |
| +--------------+-------------+--------------+ |
| |  left (400)  |    center   |  right (220) | |
| | +----------+ |             | +----------+ | |
| | | top (50) | |             | | top (50) | | |
| | +----------+ |             | +----------+ | |
| | |    mid   | |             | |    mid   | | |
| | +----------+ |             | +----------+ | |
| | | bot (50) | |             | | bot (50) | | |
| | +----------+ |             | +----------+ | |
| +--------------+-------------+--------------+ |
+-----------------------------------------------+
|                    foot (23)                  |
+-----------------------------------------------+
`,

  'sample_1': `
+-------------------------------------------------+
|                   header (72)                   |
+-------------------------------------------------+
|                      main                       |
| +---------------+--------------+--------------+ |
| |  left (220)   |     center   |  right (220) | |
| | +---+---+---+ | +----------+ | +----------+ | |
| | | L | C | R | | | CT       | | | RT       | | |
| | |   |   |   | | +----------+ | +----------+ | |
| | |   |   |   | | | CM       | | | RM       | | |
| | |   |   |   | | +----------+ | +----------+ | |
| | |   |   |   | | | CB       | | | RB       | | |
| | +---+---+---+ | +----------+ | +----------+ | |
| +---------------+--------------+--------------+ |
+-------------------------------------------------+
|                    footer (23)                  |
+-------------------------------------------------+
`,

  'sample_2': `
+-------------------------------+
|          header (300)         |
+-------------------------------+
|             main              |
| +---------------------------+ |
| |          MT (50)          | |
| +---------------------------+ |
| |          center           | |
| | +---------+---+---------+ | |
| | | L (250) | C | R (250) | | |
| | +---------+---+---------+ | |
| +---------------------------+ |
| |          MB (50)          | |
| +---------------------------+ |
+-------------------------------+
|         footer (233)          |
+-------------------------------+
`,

  'sample_3': `
+-----------------------+-------------------------------+-------------+
| left (100)            |             main              | right (500) |
|                       | +---------------------------+ |             |
| +-------+---+-------+ | |        header (50)        | | +---------+ |
| | L(10) | C | R(10) | | +---------------------------+ | | T (250) | |
| +-------+---+-------+ | |            center         | | +---------+ |
|                       | | +---------+---+---------+ | | | M       | |
|                       | | | L (250) | C | R (250) | | | +---------+ |
|                       | | +---------+---+---------+ | | | B (250) | |
|                       | +---------------------------+ | +---------+ |
|                       | |         footer (50)       | |             |
|                       | +---------------------------+ |             |
+-----------------------+-------------------------------+-------------+
`,

  'horiz': `
+-------+---+-------+
| L(10) | C | R(10) |
+-------+---+-------+
`,

  'vert': `
+---------+
| T (250) |
+---------+
| M       |
+---------+
| B (250) |
+---------+
`
};


/**
 * @param {!string} shapeName
 * @return {!string}
 */
exports.get = function(shapeName) {
  return shapeNames[shapeName];
};
