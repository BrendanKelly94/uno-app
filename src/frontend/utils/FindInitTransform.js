function FindInitTransform(target, rotate, scaleFactor) {
  let offset;
  let bBox = target.getBoundingClientRect();
  let initTransform = {};
  let width = 50 * scaleFactor;
  switch (rotate) {
    case 30:
      initTransform = {
        x: bBox.x + 50,
        y: bBox.y,
        rotate: rotate
      };
      break;
    case -30:
      offset = {
        x: width * Math.cos(Math.PI / 6),
        y: width * Math.sin(Math.PI / 6)
      };
      initTransform = {
        x: bBox.left,
        y: bBox.y + offset.y,
        rotate: rotate
      };
      break;
    case -45:
      offset = {
        x: width * Math.cos(Math.PI / 4),
        y: width * Math.sin(Math.PI / 4)
      };
      initTransform = {
        x: bBox.right - width - offset.x,
        y: bBox.y + offset.y,
        rotate: rotate
      };
      break;
    case 45:
      initTransform = {
        x: bBox.x + width,
        y: bBox.y,
        rotate: rotate
      };
      break;
    case 0:
      initTransform = {
        x: bBox.x,
        y: bBox.y,
        rotate: rotate
      };
      break;
    case -90:
      offset = {
        y: width * Math.sin(-Math.PI / 2)
      };
      initTransform = {
        x: bBox.x,
        y: bBox.y - offset.y,
        rotate: rotate
      };
      break;
    case 90:
      initTransform = {
        x: bBox.right,
        y: bBox.y,
        rotate: rotate
      };
      break;
    default:
      break;
  }
  return initTransform;
}

export default FindInitTransform;
