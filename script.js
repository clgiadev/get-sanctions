require("readmore-js");

async function sendRequest() {
  const text = document.getElementById("query-lei");

  const theUrl =
    "https://registers.esma.europa.eu/solr/esma_registers_sanctions/select?q=" +
    text.value +
    "&timestamp:[*%20TO%20*]&rows=1000&wt=xml&indent=true";

  const xmlParser = new window.DOMParser();

  const http = new XMLHttpRequest();
  await http.open("GET", theUrl);
  await http.send();
  http.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const document = xmlParser
        .parseFromString(http.responseText, "text/xml")
        .getElementsByTagName("doc");
      const arr = Array.prototype.slice.call(document);
      getSanctions(arr, text.value);
    }
  };
}

function getSanctions(arr, company_name) {
  const context = document.getElementById("result");
  const div = document.createElement("div");
  div.className = "paragraph";

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

    if (date >= new Date(2021, 0, 2) && date <= Date.now()) {
      const typeSanction =
        arrStr[
          arrStr.findIndex(
            (el) => el.getAttribute("name") === "sn_natureFullName"
          )
        ].textContent;
      const str =
        arrStr[arrStr.findIndex((el) => el.getAttribute("name") === "sn_text")]
          .textContent;
      if (name === company_name) {
        const title_h4 = document.createElement("h4");
        const paragraph = document.createElement("p");
        const span_dot = document.createElement("span");
        const span = document.createElement("span");
        span_dot.id = "dot" + i;
        span.id = "more" + i;
        span.style.display = "none";
        span_dot.innerHTML = "...";
        arrStr_content = str.split(" ");
        first_part = arrStr_content.slice(0, 50).join(" ");
        second_part = arrStr_content.slice(50).join(" ");

        title_h4.innerHTML = date;
        paragraph.innerHTML = first_part;
        paragraph.appendChild(span_dot);
        context.appendChild(title_h4);
        context.appendChild(paragraph);
        context.appendChild(span);
      }
    }
  }
}
