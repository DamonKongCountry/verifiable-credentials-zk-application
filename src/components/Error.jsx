import './../App.css'

function Error({ message, main = false }) {
  return (
    <div className={main ? "errorRect errorMain" : "errorRect"}>
      <>Error: {message}</>
    </div>
  )
}

export default Error;