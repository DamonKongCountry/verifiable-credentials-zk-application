import './../App.css'

function Error({ message }) {
  return (
    <div className="errorRect">
      <>Error: {message}</>
    </div>
  )
}

export default Error;