
// Add timeout to the api call
const fetchWithTimeout = async(url, options = {})=>{
  const {timeout = 8000} = options
  const controller = new AbortController()
  // set the timer
  const timer = setTimeout(() => {
    controller.abort()
  }, timeout);
  const response = await fetch(url,{...options,signal: controller.signal})
  // clear the timeout if it runs well
  clearTimeout(timer)
  return response;
}

export const countryData = async (req,res) => {
  const countryDataUrl = `https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies`
  try {
    const response = await fetchWithTimeout(countryDataUrl,{
      timeout: 6000,
      method: "GET",
      headers: {"contentType": "application/json"}
    })
    if(!response.ok){
            return res.status(502).json({
              error:`Request failed, status: ${response.status}`
            })
          }
    const data = await response.json()
    return data
  } catch (error) {
    return res.status(500).json({message: `${error.message}`})
  }

}

export const countryExcahngeRate = async (req,res) => {
  const countryExcahngeRateUrl = `https://open.er-api.com/v6/latest/USD`
  try {
    const response = await fetchWithTimeout(countryExcahngeRateUrl,{
      timeout: 6000,
      method: "GET",
      headers: {"contentType": "application/json"}
    })
    if(!response.ok){
            return res.status(502).json({
              error:`Request failed, status: ${response.status}`
            })
          }
    const data = await response.json()
    return data
  } catch (error) {
    return res.status(500).json({message: `${error.message}`})
  }

}
