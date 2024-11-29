async function sendRequest() {
  const elements = document.getElementById("result");
  const text = document.getElementById("query-lei");

  arr = Array.prototype.slice.call(elements.getElementsByTagName("div"));
  if (arr.length !== 0) arr.forEach((el) => elements.removeChild(el));

  const theUrl =
    "https://corsproxy.io/?https://registers.esma.europa.eu/solr/esma_registers_sanctions/select?q=" +
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

function readMore() {
  const span = document.getElementById("more" + 0);
  const span_dot = document.getElementById("dot" + 0);
  const button = document.getElementById("button" + 0);
  if ((span.style.display = "none")) {
    span_dot.style.display = "none";
    span.style.display = "block";
    button.innerHTML = "Hide content";
  } else {
    span.style.display = "none";
    span_dot.style.display = "block";
    button.innerHTML = "Hide content";
  }
}

function getSanctions(arr, company_name) {
  const re = new RegExp(company_name, "i");
  const context = document.getElementById("result");

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

    if (date >= new Date(2012, 0, 2) && date <= Date.now()) {
      const typeSanction =
        arrStr[
          arrStr.findIndex(
            (el) => el.getAttribute("name") === "sn_natureFullName"
          )
        ].textContent;

      const str =
        arrStr[arrStr.findIndex((el) => el.getAttribute("name") === "sn_text")]
          .textContent;

      if (name.match(re) || str.match(re)) {
        const div = document.createElement("div");
        div.id = "container_" + i;
        div.style.overflow = "scroll";

        const title_h4 = document.createElement("h4");
        const paragraph = document.createElement("p");
        const span_dot = document.createElement("span");
        const span = document.createElement("span");
        const button = document.createElement("button");
        button.id = "button_" + i;
        button.innerHTML = "Read more";
        span_dot.id = "dot_" + i;
        span.id = "more_" + i;
        span.style.display = "none";
        span_dot.innerHTML = "...";
        arrStr_content = str.split(" ");
        first_part = arrStr_content.slice(0, 50).join(" ");
        second_part = arrStr_content.slice(50).join(" ");

        span.innerHTML = " " + second_part;
        title_h4.innerHTML = date;
        paragraph.innerHTML = first_part;
        paragraph.appendChild(span_dot);
        paragraph.appendChild(span);
        context.appendChild(div);
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
      }
    }
  }
}
