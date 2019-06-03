import react, {useState} from 'react'

function useError () {
  const [ error, setError ] = useState({status: false, message:""});

  const errorHandler = fn => (params) => {
    Promise.resolve(fn(params)).catch(err => {
      if(!err.status) err.status = 500;
      setError({status: err.status, message: err.message});
    })
  }

  return [ error, errorHandler ]
}

export default useError;
