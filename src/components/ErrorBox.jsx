import React from 'react'

const ErrorBox = (props) => {
  return (
    <>
      <p className='text-red-900 bg-red-400 p-2 rounded-sm'>{props.msg}</p>
    </>
  )
}

export default ErrorBox
