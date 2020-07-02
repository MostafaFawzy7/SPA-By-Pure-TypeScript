// General Variables

const listOfVidsElms = document.getElementById("listOfRequests") as HTMLDivElement;
const SUPER_USER_ID: string = "19940226";
const state: any = {
  sortBy: "newFirst",
  searchTerm: "",
  filterBy: "all",
  userId: "",
  isSuperUser: false,
};

function renderSingleVidReq(vidInfo: any, isPrepend: boolean = false): void {
  const videoReqTemplate = `
      <div class='card mb-3'>
        <div class="card-header d-flex justify-content-between">
          <select id="admin_change_status_${vidInfo._id}">
              <option value="new">new</option>
              <option value="planned">planned</option>
              <option value="done">done</option>
          </select>
          <div class="input-group ml-2 mr-5 ${
    vidInfo.status !== "done" ? "d-none" : ""
    }" id="admin_video_res_container_${vidInfo._id}">
              <input type="text" class="form-control" id="admin_video_res_${
    vidInfo._id
    }" placeholder="Paste here youtube video id">
              <div class="input-group-append">
                  <button class="btn btn-outline-secondary" id="admin_save_video_res_${
    vidInfo._id
    }" type="button">Save</button>
              </div>
          </div>
          <button class="btn btn-danger" id="admin_delete_video_req_${
    vidInfo._id
    }">delete</button>
        </div>
        <div class='card-body d-flex justify-content-between flex-row'>
            <div class='d-flex flex-column'>
                <h3>${vidInfo.topic_title}</h3>
                <p class='text-muted mb-2'>${vidInfo.topic_details}</p>
                <p class='mb-0 text-muted'>
                    ${
    vidInfo.expected_result &&
    `<strong>Expected results:</strong> ${vidInfo.expected_result}`
    }
                </p>
            </div>
            ${
    vidInfo.status === "done"
      ? `
                <div class="ml-auto mr-3">
                  <iframe
                    width="240"
                    height="135"
                    src="https://www.youtube.com/embed/${vidInfo.video_ref.link}"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </div>`
      : ""
    }
            <div class='d-flex flex-column text-center'>
                <a id="votes_ups_${vidInfo._id}" class='btn btn-link'>🔺</a>
                <h3 id="score_vote_${vidInfo._id}">
                  ${vidInfo.votes.ups.length - vidInfo.votes.downs.length}
                </h3>
                <a id="votes_downs_${vidInfo._id}" class='btn btn-link'>🔻</a>
            </div>
        </div>
        <div class='card-footer d-flex flex-row justify-content-between'>
            <div class="${
    vidInfo.status === "done"
      ? "text-success"
      : vidInfo.status === "planned"
        ? "text-primary"
        : ""
    }">
                <span>${vidInfo.status.toUpperCase()} ${
    vidInfo.status === "done"
      ? ` on ${new Date(vidInfo.video_ref.date).toLocaleDateString()}`
      : ""
    }</span> &bullet; added by
                <strong>${vidInfo.author_name}</strong> on
                <strong>${new Date(
      vidInfo.submit_date
    ).toLocaleDateString()}</strong>
            </div>
            <div class='d-flex justify-content-center flex-column 408ml-auto mr-2'>
                <div class='badge badge-success'>
                    ${vidInfo.target_level}
                </div>
            </div>
        </div>
      </div>
  `;

  // Rendering Posts with their own Sorting Orders & Votes

  const vidReqContainerElm = document.createElement("div") as HTMLDivElement;
  vidReqContainerElm.innerHTML = videoReqTemplate;

  // Ordering Of Sorting

  if (isPrepend) {
    listOfVidsElms.prepend(vidReqContainerElm);
  } else {
    listOfVidsElms.appendChild(vidReqContainerElm);
  }

  // CRUD Operations

  // Updating Function
  function updateVideoStatus(id: any, status: any, resVideo: any) {
    fetch("http://localhost:7777/video-request", {
      method: "PUT",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({ id, status, resVideo }),
    })
      .then((res) => res.json())
      .then((data) => window.location.reload());
  }

  // CRUD Buttons' Selectors
  const adminChangeStatusElm = document.getElementById(
    `admin_change_status_${vidInfo._id}`
  ) as HTMLSelectElement;
  const adminVideoResElm = document.getElementById(
    `admin_video_res_${vidInfo._id}`
  ) as HTMLInputElement;
  const adminSaveVideoResElm = document.getElementById(
    `admin_save_video_res_${vidInfo._id}`
  ) as HTMLButtonElement;
  const adminDeleteVideoReqElm = document.getElementById(
    `admin_delete_video_req_${vidInfo._id}`
  ) as HTMLButtonElement;

  if (state.isSuperUser) {
    adminChangeStatusElm.value = vidInfo.status;
    adminVideoResElm.value = vidInfo.video_ref.link;

    // Change Status Operation
    adminChangeStatusElm.addEventListener("change", (e: any) => {
      const adminVideoResContainer = document.getElementById(
        `admin_video_res_container_${vidInfo._id}`
      ) as HTMLDivElement;

      if (e.target.value === "done") {
        adminVideoResContainer.classList.remove("d-none");
      } else {
        updateVideoStatus(vidInfo._id, e.target.value, '');
      }
    });

    // Save Post Operation
    adminSaveVideoResElm.addEventListener("click", (e) => {
      e.preventDefault();

      if (!adminVideoResElm.value) {
        adminVideoResElm.classList.add("is-invalid");
        adminVideoResElm.addEventListener("input", () => {
          adminVideoResElm.classList.remove("is-invalid");
        });
        return;
      }

      updateVideoStatus(vidInfo._id, "done", adminVideoResElm.value);
    });

    // Delete Operation
    adminDeleteVideoReqElm.addEventListener("click", (e) => {
      e.preventDefault();

      const isSure = confirm(
        `Are you sure you want To delete "${vidInfo.topic_title}"`
      );
      if (!isSure) return;

      fetch("http://localhost:7777/video-request", {
        method: "DELETE",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({ id: vidInfo._id }),
      })
        .then((res) => res.json())
        .then((data) => window.location.reload());
    });
  }

  // Implementation Of Voting

  applyVoteStyle(vidInfo._id, vidInfo.votes, vidInfo.status === "done", '');

  const scoreVoteElm: any = document.getElementById(`score_vote_${vidInfo._id}`)!;
  const votesElms = document.querySelectorAll(
    `[id^=votes_][id$=_${vidInfo._id}]`
  );

  votesElms.forEach((elm) => {
    if (state.isSuperUser || vidInfo.status === "done") {
      return;
    }

    elm.addEventListener("click", function (e: any) {
      e.preventDefault();

      const [, vote_type, id] = e.target.getAttribute("id").split("_");

      fetch("http://localhost:7777/video-request/vote", {
        method: "PUT",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({ id, vote_type, user_id: state.userId }),
      })
        .then((data) => data.json())
        .then((data) => {
          scoreVoteElm.innerText = data.ups.length - data.downs.length;

          applyVoteStyle(id, data, vidInfo.status === "done", vote_type);
        });
    });
  });
}

// Implementation Of Voting Default State

function applyVoteStyle(video_id: any, votes_list: any, isDisabled: boolean, vote_type: any) {
  const votesUpsElm: any = document.getElementById(`votes_ups_${video_id}`) as HTMLAnchorElement;
  const votesDownsElm: any = document.getElementById(`votes_downs_${video_id}`) as HTMLAnchorElement;

  if (isDisabled) {
    votesUpsElm.style.opacity = 0.5;
    votesUpsElm.style.cursor = "not-allowed";
    votesDownsElm.style.opacity = 0.5;
    votesDownsElm.style.cursor = "not-allowed";
    return;
  }

  if (!vote_type) {
    if (votes_list.ups.includes(state.userId)) {
      vote_type = "ups";
    } else if (votes_list.downs.includes(state.userId)) {
      vote_type = "downs";
    } else {
      return;
    }
  }

  const voteDirElm = vote_type === "ups" ? votesUpsElm : votesDownsElm;
  const otherDirElm = vote_type === "ups" ? votesDownsElm : votesUpsElm;

  if (votes_list[vote_type].includes(state.userId)) {
    voteDirElm.style.opacity = 1;
    otherDirElm.style.opacity = 0.5;
  } else {
    otherDirElm.style.opacity = 1;
  }
}

// Implementation of fetching Posts, Sorting, Searching and Filtering

function loadAllVidReqs(
  sortBy = "newFirst",
  searchTerm = "",
  filterBy = "all"
) {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}&filterBy=${filterBy}`
  )
    .then((data) => data.json())
    .then((data) => {
      listOfVidsElms.innerHTML = "";
      data.forEach((vidInfo: any) => {
        renderSingleVidReq(vidInfo);
      });
    });
}

// Debouncing Implementation

function debounce(fn: any, time: number) {
  let timeout: any;

  return function (this: any, ...args: any) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
}

// Form Validation

function checkValidity(formData: any): boolean {
  const topic = formData.get("topic_title");
  const topicDetails = formData.get("topic_details");
  const topicTitle = document.querySelector("[name=topic_title]") as HTMLInputElement;
  const textAreaDetails = document.querySelector("[name=topic_details]") as HTMLTextAreaElement;

  if (!topic || topic.length > 30) {
    topicTitle.classList.add("is-invalid");
  }

  if (!topicDetails) {
    textAreaDetails.classList.add("is-invalid");
  }

  const allInvalidElms = document
    .getElementById("videoRequestForm")!
    .querySelectorAll(".is-invalid");

  if (allInvalidElms.length) {
    allInvalidElms.forEach((elm) => {
      elm.addEventListener("input", function (this: typeof elm) {
        this.classList.remove("is-invalid");
      });
    });

    return false;
  }

  return true;
}

// Loading DOM Content

document.addEventListener("DOMContentLoaded", () => {
  const vidReqFormElm = document.getElementById("videoRequestForm") as HTMLFormElement;
  const sortByElms = document.querySelectorAll("[id*=sort_by_]");
  const searchBoxElm = document.getElementById("search_box") as HTMLInputElement;
  const loginFormElm = document.querySelector(".login-form") as HTMLDivElement;
  const contentAppElm = document.querySelector(".content-app") as HTMLDivElement;
  const filterByElms = document.querySelectorAll("[id^=filter_by_]");
  const normalUserCOntent = document.querySelector(".normal-user-content") as HTMLDivElement;

  if (window.location.search) {
    state.userId = new URLSearchParams(window.location.search).get("id");
    if (state.userId === SUPER_USER_ID) {
      state.isSuperUser = true;
      normalUserCOntent.classList.add("d-none");
    }
    loginFormElm.classList.add("d-none");
    contentAppElm.classList.remove("d-none");
  }

  // Get new posts sorted by newFirst or topVoted

  loadAllVidReqs();

  sortByElms.forEach((elm) => {
    elm.addEventListener("click", function (this: typeof elm, e: any) {
      e.preventDefault();

      const sortByNew = document.getElementById("sort_by_new") as HTMLLabelElement;
      const sortByTop = document.getElementById("sort_by_top") as HTMLLabelElement;
      
      state.sortBy = this.querySelector("input")!.value;
      loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);

      this.classList.add("active");
      if (state.sortBy === "topVotedFirst") {
        sortByNew.classList.remove("active");
      } else {
        sortByTop.classList.remove("active");
      }
    });
  });

  // Implementation Of Filtering

  filterByElms.forEach((elm) => {
    elm.addEventListener("click", function (this: typeof elm, e: any) {
      e.preventDefault();

      state.filterBy = e.target.getAttribute("id").split("_")[2];

      filterByElms.forEach(option => option.classList.remove('active'));
      this.classList.add('active');
      loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);
    });
  });

  // Implementation Of Search Capapility

  searchBoxElm.addEventListener(
    "input",
    debounce((e: any) => {
      state.searchTerm = e.target.value;

      loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);
    }, 300)
  );

  // Adding new posts

  vidReqFormElm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(vidReqFormElm);
    formData.append("author_id", state.userId);

    const isValid = checkValidity(formData);

    if (!isValid) return;

    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((data) => data.json())
      .then((data) => {
        renderSingleVidReq(data, true);
      });
  });
});