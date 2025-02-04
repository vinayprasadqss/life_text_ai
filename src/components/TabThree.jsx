import React from 'react'

const TabThree = ({tab,setTab}) => {
  return (
    <div className='wrapper2'>
    <p>Congratulations, your message has been scheduled!</p>
    <button onClick={()=>setTab(2)}>Schedule Another Message</button>
    </div>
  )
}

export default TabThree
