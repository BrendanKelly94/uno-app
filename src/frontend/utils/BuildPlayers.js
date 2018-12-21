function BuildPlayers({ players, username, scaleFactor}){
  const temp = players.slice();
  const start = temp.findIndex((player) => player.name === username);
  let s;
  for(let i = 0; i < start; i++){
    s = temp.shift();
    temp.push(s);
  }
  temp.shift();
  console.log(scaleFactor.x)
  //set translate, rotate, and scale
  for(let i = 0; i < temp.length; i++){
    temp[i].translate = {x: (window.innerWidth * scaleFactor.x) * Math.cos(-Math.PI/(temp.length - 1) * i), y: (window.innerHeight * scaleFactor.y) * Math.sin(-Math.PI/(temp.length - 1) * i) }
    temp[i].rotate = 90 - 180/(temp.length - 1) * i;
    temp[i].scale = scaleFactor.size;
  }
  return temp;
}

export default BuildPlayers;
