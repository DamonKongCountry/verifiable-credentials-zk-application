import './../App.css'

function Error({ message, main = false }) {
  return (
    <div className={main ? "errorRect errorMain" : "errorRect"}>
      <p>Error: {message}</p>
    </div>
  )
}

export default Error;