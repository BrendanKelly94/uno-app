function BuildPlayers({ players, username, scaleFactor }) {
  const temp = players.slice();
  const start = temp.findIndex(player => player.user_name === username);
  let s;
  for (let i = 0; i < start; i++) {
    s = temp.shift();
    temp.push(s);
  }
  temp.shift();

  if (temp.length === 1) {
    temp[0].translate = {
      x: 50 * scaleFactor.x,
      y: -window.innerHeight * scaleFactor.y
    };
    temp[0].rotate = 0;
    temp[0].scale = scaleFactor.size;
  } else {
    for (let i = 0; i < temp.length; i++) {
      temp[i].translate = {
        x:
          window.innerWidth *
            scaleFactor.x *
            Math.cos((-Math.PI / (temp.length - 1)) * i) +
          50 * scaleFactor.x,
        y:
          window.innerHeight *
          scaleFactor.y *
          Math.sin((-Math.PI / (temp.length - 1)) * i)
      };
      temp[i].rotate = 90 - (180 / (temp.length - 1)) * i;
      temp[i].scale = scaleFactor.size;
    }
  }

  return temp;
}

export default BuildPlayers;
