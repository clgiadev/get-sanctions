function readCSV() {
  return (reader = fetch("./enforcementactions.csv")
    .then((response) => response.text())
    .then((text) => text)
    .catch((e) => console.log(e)));
}

async function sendRequest() {
  const elements = document.getElementById("result");
  const text = document.getElementById("query-lei");
  // just a check
  const geo_area = document.getElementById("nation-choice");
  const selected_option = geo_area.value;

  arr = Array.prototype.slice.call(elements.getElementsByTagName("div"));
  if (arr.length !== 0) arr.forEach((el) => elements.removeChild(el));

  switch (selected_option) {
    case "UE":
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
          getSanctions(arr, text.value, geo_area.value);
        }
      };
      break;
    case "US":
      const arrCSV = (await readCSV()).split("\r");
      const arrCompany =
        text.value !== ""
          ? arrCSV.filter((el) =>
              el.toLowerCase().includes(text.value.toLowerCase())
            )
          : [];
      getSanctions(arrCompany, text.value, geo_area.value);

      break;
  }
}

function appendDiv(arr, geo_area) {
  const context = document.getElementById("result");
  switch (geo_area) {
    case "UE":
      arr_of_Object = [];
      for (let el of arr) {
        let obj = { date: new Date(el.childNodes[0].textContent), div: el };
        arr_of_Object.push(obj);
      }

      arr_of_Object.sort((a, b) => (a.date > b.date ? -1 : 1));
      arr_of_Object.forEach((el) => context.appendChild(el.div));
      break;
    case "US":
      for (el of arr) {
        context.appendChild(el);
      }
  }
}

function getSanctions(arr, company_name, geo_area) {
  const re = new RegExp(company_name, "i");
  const lenght_80 = Math.floor(company_name.length * 0.8);
  const company_name_80 = company_name.substring(0, lenght_80);
  const re_80 = new RegExp(company_name_80, "i");

  let divs = [];
  if (geo_area === "UE") {
    for (let i = 0; i < arr.length; i++) {
      const arrStr = Array.prototype.slice.call(
        arr[i].getElementsByTagName("str")
      );

      date_str = String(
        arrStr[
          arrStr.findIndex((el) => el.getAttribute("name") === "sn_dateStr")
        ].textContent
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
          arrStr.findIndex((el) => el.getAttribute("name") === "sn_text") !== -1
            ? arrStr[
                arrStr.findIndex((el) => el.getAttribute("name") === "sn_text")
              ].textContent
            : "";

        const str_translated =
          arrStr.findIndex(
            (el) => el.getAttribute("name") === "sn_translatedText"
          ) !== -1
            ? arrStr[
                arrStr.findIndex(
                  (el) => el.getAttribute("name") === "sn_translatedText"
                )
              ].textContent
            : "";

        /*=======================================================================
          ==== CHECK IF EXISTS A LONG MATCH BETWEEN NAME AND SANCTION'S TEXT ====
          =======================================================================
        */

        // const matcher_transl = new difflib.SequenceMatcher(null, company_name.toLowerCase(), str_translated.toLowerCase());
        // const longest_match_transl = difflib.getCloseMatches(company_name.toLowerCase(), str.toLowerCase());
        // console.log(longest_match_transl);
        // if(longest_match_transl !== no_match && (longest_match_transl[2] - longest_match_transl[1]) >= company_name.length - 5 && longest_match_transl[0] === 0)
        //   console.log(str_translated.substring(longest_match_transl[1], longest_match_transl[1] + longest_match_transl[2]));
        // console.log(str_translated.substring(longest_match_transl[1], longest_match_transl[1] + longest_match_transl[2]));
        // console.log(str_translated.substring(longest_match_transl[1]));

        if (
          name.match(re) ||
          str.match(re) ||
          str_translated.match(re) ||
          str.match(re_80) ||
          str_translated.match(re_80)
        ) {
          const div = document.createElement("div");
          div.id = "container_" + i;

          const title_h4 = document.createElement("h4");
          const paragraph = document.createElement("p");
          str_translated.length !== 0
            ? (arrStr_content = str_translated.split(" "))
            : (arrStr_content = str.split(" "));
          first_part = arrStr_content.slice(0, 50).join(" ");
          second_part = arrStr_content.slice(50).join(" ");
          title_h4.innerHTML = date;
          if (second_part.length > 10) {
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

          divs.push(div, geo_area);
        }
      }
    }
  } else if (geo_area === "US") {
    if (arr.length === 0) return;
    const regex_1 = new RegExp(/"[^"]+"/g);
    const regex_2 = new RegExp(/\/(.+htm)/);
    const regex_3 = new RegExp(/\/(.+pdf)/);
    for (let i = 0; i < arr.length; i++) {
      console.log(arr);
      const temp_Str = arr[i].match(regex_1) ? arr[i].match(regex_1) : [];
      const temp_Str_2 = arr[i].match(regex_2)
        ? arr[i].match(regex_2)
        : arr[i].match(regex_3)
        ? arr[i].match(regex_3)
        : [];

      const info_company = arr[i].split(",");
      const div = document.createElement("div");
      const title_h4 = document.createElement("h4");
      const paragraph = document.createElement("p");
      const span_company = document.createElement("span");
      const span_type = document.createElement("span");

      span_company.style.color = "#116466";
      span_company.innerText =
        temp_Str.length !== 0
          ? temp_Str[0].replaceAll('"', "")
          : info_company[2].length !== 0
          ? info_company[2] + " " + info_company[3] + " " + info_company[4]
          : info_company[3].length !== 0
          ? info_company[3] + " " + info_company[4]
          : info_company[4];

      title_h4.innerHTML =
        "Start Date:   " +
        info_company[0] +
        (info_company[1] !== ""
          ? " - End Date:   " + info_company[1] + "   "
          : "   ");
      title_h4.appendChild(span_company);

      paragraph.appendChild(span_type);
      span_type.innerText = "Action:   ";
      span_type.style.color = "#116466";

      paragraph.innerHTML =
        paragraph.innerHTML +
        (temp_Str.length > 1
          ? temp_Str[1].replaceAll('"', "")
          : arr[i].replace(regex_1, "").split(",")[5]);

      div.appendChild(title_h4);
      div.appendChild(paragraph);
      console.log(temp_Str_2);
      if (temp_Str_2.length !== 0) {
        const p_link = document.createElement("p");
        const link = document.createElement("a");
        link.href =
          "https://www.federalreserve.gov/" +
          temp_Str_2[0].replace(/\/\/www.federalreserve.gov\//, "");
        link.innerHTML = "More info about";
        link.target = "_blank";
        p_link.appendChild(link);
        div.appendChild(p_link);
      }

      divs.push(div);
    }
  }

  if (divs.length !== 0) appendDiv(divs, geo_area);
}
