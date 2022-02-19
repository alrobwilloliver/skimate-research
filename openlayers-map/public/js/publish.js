var longlats =
[[23.44597, 41.775824488072445 ],
[23.44598, 41.775824488072446],
[23.44599, 41.775824488072447],
[23.44600, 41.775824488072448]];
const socket = io({ transports: ['websocket'] });
let count = 1;
setInterval(function() {
  console.log(count);
  if (count < 10000){
    const item = {};
    item.Coordinate = {};
    item.Coordinate.Longitude = longlats[count][0];
    item.Coordinate.Latitude = longlats[count][1];
    count++;
    socket.emit('lastKnownLocation', item);
  }
}, 5000);
