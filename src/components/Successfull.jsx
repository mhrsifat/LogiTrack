import React from 'react'

const Successfull = (props) => {
  return (
    <>
      <p className='text-green-900 bg-green-400 p-2 rounded-sm'>{props.msg}</p>
    </>
  )
}

export default Successfull
