function ApiEndpoint(uri) {
  this.uri = uri;
  this.getReq = async () => {
    try {
      const res = await fetch(this.uri);
      const json = await res.json();
      if(json.status) throw json;
      return json;
    } catch (e) {
      throw e;
    }
  };
  this.postReq = async json => {
    try {
      const res = await fetch(this.uri, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(json)
      });
      const rJson = await res.json();
      if(rJson.status) throw rJson;
      return rJson;
    } catch (e) {
      throw e;
    }
  };
}

export default ApiEndpoint;
