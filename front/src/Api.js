const base_url = 'http://localhost:8001/api';

function apiFetch(url, params = {}) {
    params.headers = params.headers ? params.headers : {};
  
    return new Promise((resolve, reject) => {
      fetch(`${base_url}${url}`, params)
        .then(res => res.json())
        .then(data => {
            if(data.error) {
                reject();
            }
            resolve(data);
        })
        .catch(error => {
            reject(error)
        });
    });
}


export default {
    apiFetch,
};