const fetchData = async({url, method="POST", token='', body = null}, dispatch)=>{
    const headers = token?{'Content-Type': 'application', authorization:`Bearer ${token}`} : {'Content-Type': 'application'} 
}

export default fetchData