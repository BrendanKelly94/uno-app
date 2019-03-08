// const server = 'http://localhost:3000'
function ApiEndpoint(uri){
  this.uri = uri;
  this.getReq = async () => {
    try{
      const res = await fetch(this.uri);
      const json = await res.json();
      return json;
    }catch(e){
      throw new Error(e);
    }
  }
  this.postReq = async (json) => {
    try{
      const res = await fetch(this.uri, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(json)
      })
      const rJson = await res.json();
      return rJson;
    }catch(e){
      throw new Error(e);
    }
  }
}

export default ApiEndpoint;
