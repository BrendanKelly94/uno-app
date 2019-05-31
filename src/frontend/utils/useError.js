import react, {useState} from 'react'

function useError () {
  const [ error, setError ] = useState({status: false, message:""});

  const errorHandler = fn => (params) => {
    Promise.resolve(fn(params)).catch(err => {
      setError(err);
    })
  }

  return [ error, errorHandler ]
}

export default useError;
