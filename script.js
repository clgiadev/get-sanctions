async function sendRequest() {
  const elements = document.getElementById("result");
  const text = document.getElementById("query-lei");
  // just a check
  const geo_area = document.getElementById('nation-choice');
  const selected_option = geo_area.value;


  arr = Array.prototype.slice.call(elements.getElementsByTagName("div"));
  if (arr.length !== 0) arr.forEach((el) => elements.removeChild(el));

  const theUrl =
    "https://corsproxy.io/?https://registers.esma.europa.eu/solr/esma_registers_sanctions/select?q=" +
    text.value +
    "&timestamp:[*%20TO%20*]&rows=1000&wt=xml&indent=true";

  switch (selected_option) {
    case "UE":  const xmlParser = new window.DOMParser();
                const http = new XMLHttpRequest();
                await http.open("GET", theUrl);
                await http.send();
                http.onreadystatechange = function () {
                  if (this.readyState == 4 && this.status == 200) {
                    const document = xmlParser.parseFromString(http.responseText, "text/xml")
                                              .getElementsByTagName("doc");
                    const arr = Array.prototype.slice.call(document);
                    getSanctions(arr, text.value);
                  }
                };
                break;
    // case "US":  const path = './enforcementactions.csv';
    //             fs.createReadStream(path)
    //               .pipe(parse({delimiter:",", from_line: 1}))
    //               .on("data", function(row) {
    //                 console.lot(row);
    //               })
    //               .on("error", function (error) {
    //                 // Handle the errors
    //                 console.log(error.message);
    //               })
    //               .on("end", function () {
    //                 // executed when parsing is complete
    //                 console.log("File read successful");
    //               });
    }
}

function appendDiv(arr) {
  const context = document.getElementById("result");
  arr_of_Object = [];
  for (let el of arr) {
    let obj = { date: new Date(el.childNodes[0].textContent), div: el };
    arr_of_Object.push(obj);
  }

  arr_of_Object.sort((a, b) => (a.date > b.date ? -1 : 1));
  arr_of_Object.forEach((el) => context.appendChild(el.div));
}

function getSanctions(arr, company_name) {
  const re = new RegExp(company_name, "i");
  let divs = [];

  for (let i = 0; i < arr.length; i++) {
    const arrStr = Array.prototype.slice.call(
      arr[i].getElementsByTagName("str")
    );

    date_str = String(
      arrStr[arrStr.findIndex((el) => el.getAttribute("name") === "sn_dateStr")]
        .textContent
    ).split("/");

    const date = new Date(
      parseInt(date_str[2]),
      parseInt(date_str[1]) - 1,
      parseInt(date_str[0])
    );

    const name =
      arrStr.findIndex(
        (el) => el.getAttribute("name") === "sn_otherEntityName"
      ) !== -1
        ? arrStr[
            arrStr.findIndex(
              (el) => el.getAttribute("name") === "sn_otherEntityName"
            )
          ].textContent
        : "";

    if (date >= new Date(2012, 0, 2)) {
      const str =
        arrStr[arrStr.findIndex((el) => el.getAttribute("name") === "sn_text")]
          .textContent;

      if (name.match(re) || str.match(re)) {
        const div = document.createElement("div");
        div.id = "container_" + i;

        const title_h4 = document.createElement("h4");
        const paragraph = document.createElement("p");
        arrStr_content = str.split(" ");
        first_part = arrStr_content.slice(0, 50).join(" ");
        second_part = arrStr_content.slice(50).join(" ");
        title_h4.innerHTML = date;
        if(second_part.length  > 10) {
          const span_dot = document.createElement("span");
          const span = document.createElement("span");
          const button = document.createElement("button");
          button.id = "button_" + i;
          button.innerHTML = "Read more";
          span_dot.id = "dot_" + i;
          span.id = "more_" + i;
          span.style.display = "none";
          span_dot.innerHTML = "...";
      
  
          span.innerHTML = " " + second_part;
          
          paragraph.innerHTML = first_part;
          paragraph.appendChild(span_dot);
          paragraph.appendChild(span);
  
          div.appendChild(title_h4);
          div.appendChild(paragraph);
          div.appendChild(button);
          button.addEventListener("click", (event) => {
            const i = button.id.split("_")[1];
            const span = document.getElementById("more_" + i);
            const span_dot = document.getElementById("dot_" + i);
            if (span.style.display === "none") {
              span_dot.style.display = "none";
              span.style.display = "inline";
              button.innerHTML = "Hide content";
            } else {
              span.style.display = "none";
              span_dot.style.display = "inline";
              button.innerHTML = "Read more";
            }
          });
        } else {
          paragraph.innerHTML = first_part + " " + second_part;
          div.appendChild(title_h4);
          div.appendChild(paragraph);
        }
       
        divs.push(div);
      }
    }
  }

  appendDiv(divs);
}
