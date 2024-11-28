async function sendRequest() {
    const text = document.getElementById('query-lei');


    const theUrl = "https://registers.esma.europa.eu/solr/esma_registers_sanctions/select?q="+ text.value +"&timestamp:[*%20TO%20*]&rows=1000&wt=xml&indent=true"
   
    const xmlParser = new window.DOMParser()
    
    const http = new XMLHttpRequest();
    await http.open("GET",theUrl);
    await http.send();
    http.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            const document = xmlParser.parseFromString(http.responseText, 'text/xml').getElementsByTagName('str');
            const arr = Array.prototype.slice.call(document);
            const index_ln = arr.findIndex((el) => el.getAttribute('name') === 'sn_otherEntityName')
            const index_doc = arr.findIndex((el) => el.getAttribute('name') === 'sn_text')
            getSanctions([arr[index_ln].textContent, arr[index_doc].textContent])
        }
    }

    
}


function getSanctions(arr) {
    const title = document.getElementById('result').firstElementChild;
    const paragraph = document.getElementById('result').lastElementChild;
    title.innerHTML += arr[0];
    paragraph.innerHTML = arr[1];
}