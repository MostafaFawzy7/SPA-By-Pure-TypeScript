// General Variables
var listOfVidsElms = document.getElementById("listOfRequests");
var SUPER_USER_ID = "19940226";
var state = {
    sortBy: "newFirst",
    searchTerm: "",
    filterBy: "all",
    userId: "",
    isSuperUser: false
};
function renderSingleVidReq(vidInfo, isPrepend) {
    if (isPrepend === void 0) { isPrepend = false; }
    var videoReqTemplate = "\n      <div class='card mb-3'>\n        <div class=\"card-header d-flex justify-content-between\">\n          <select id=\"admin_change_status_" + vidInfo._id + "\">\n              <option value=\"new\">new</option>\n              <option value=\"planned\">planned</option>\n              <option value=\"done\">done</option>\n          </select>\n          <div class=\"input-group ml-2 mr-5 " + (vidInfo.status !== "done" ? "d-none" : "") + "\" id=\"admin_video_res_container_" + vidInfo._id + "\">\n              <input type=\"text\" class=\"form-control\" id=\"admin_video_res_" + vidInfo._id + "\" placeholder=\"Paste here youtube video id\">\n              <div class=\"input-group-append\">\n                  <button class=\"btn btn-outline-secondary\" id=\"admin_save_video_res_" + vidInfo._id + "\" type=\"button\">Save</button>\n              </div>\n          </div>\n          <button class=\"btn btn-danger\" id=\"admin_delete_video_req_" + vidInfo._id + "\">delete</button>\n        </div>\n        <div class='card-body d-flex justify-content-between flex-row'>\n            <div class='d-flex flex-column'>\n                <h3>" + vidInfo.topic_title + "</h3>\n                <p class='text-muted mb-2'>" + vidInfo.topic_details + "</p>\n                <p class='mb-0 text-muted'>\n                    " + (vidInfo.expected_result &&
        "<strong>Expected results:</strong> " + vidInfo.expected_result) + "\n                </p>\n            </div>\n            " + (vidInfo.status === "done"
        ? "\n                <div class=\"ml-auto mr-3\">\n                  <iframe\n                    width=\"240\"\n                    height=\"135\"\n                    src=\"https://www.youtube.com/embed/" + vidInfo.video_ref.link + "\"\n                    frameborder=\"0\"\n                    allowfullscreen\n                  ></iframe>\n                </div>"
        : "") + "\n            <div class='d-flex flex-column text-center'>\n                <a id=\"votes_ups_" + vidInfo._id + "\" class='btn btn-link'>\uD83D\uDD3A</a>\n                <h3 id=\"score_vote_" + vidInfo._id + "\">\n                  " + (vidInfo.votes.ups.length - vidInfo.votes.downs.length) + "\n                </h3>\n                <a id=\"votes_downs_" + vidInfo._id + "\" class='btn btn-link'>\uD83D\uDD3B</a>\n            </div>\n        </div>\n        <div class='card-footer d-flex flex-row justify-content-between'>\n            <div class=\"" + (vidInfo.status === "done"
        ? "text-success"
        : vidInfo.status === "planned"
            ? "text-primary"
            : "") + "\">\n                <span>" + vidInfo.status.toUpperCase() + " " + (vidInfo.status === "done"
        ? " on " + new Date(vidInfo.video_ref.date).toLocaleDateString()
        : "") + "</span> &bullet; added by\n                <strong>" + vidInfo.author_name + "</strong> on\n                <strong>" + new Date(vidInfo.submit_date).toLocaleDateString() + "</strong>\n            </div>\n            <div class='d-flex justify-content-center flex-column 408ml-auto mr-2'>\n                <div class='badge badge-success'>\n                    " + vidInfo.target_level + "\n                </div>\n            </div>\n        </div>\n      </div>\n  ";
    // Rendering Posts with their own Sorting Orders & Votes
    var vidReqContainerElm = document.createElement("div");
    vidReqContainerElm.innerHTML = videoReqTemplate;
    // Ordering Of Sorting
    if (isPrepend) {
        listOfVidsElms.prepend(vidReqContainerElm);
    }
    else {
        listOfVidsElms.appendChild(vidReqContainerElm);
    }
    // CRUD Operations
    // Updating Function
    function updateVideoStatus(id, status, resVideo) {
        fetch("http://localhost:7777/video-request", {
            method: "PUT",
            headers: { "content-Type": "application/json" },
            body: JSON.stringify({ id: id, status: status, resVideo: resVideo })
        })
            .then(function (res) { return res.json(); })
            .then(function (data) { return window.location.reload(); });
    }
    // CRUD Buttons' Selectors
    var adminChangeStatusElm = document.getElementById("admin_change_status_" + vidInfo._id);
    var adminVideoResElm = document.getElementById("admin_video_res_" + vidInfo._id);
    var adminSaveVideoResElm = document.getElementById("admin_save_video_res_" + vidInfo._id);
    var adminDeleteVideoReqElm = document.getElementById("admin_delete_video_req_" + vidInfo._id);
    if (state.isSuperUser) {
        adminChangeStatusElm.value = vidInfo.status;
        adminVideoResElm.value = vidInfo.video_ref.link;
        // Change Status Operation
        adminChangeStatusElm.addEventListener("change", function (e) {
            var adminVideoResContainer = document.getElementById("admin_video_res_container_" + vidInfo._id);
            if (e.target.value === "done") {
                adminVideoResContainer.classList.remove("d-none");
            }
            else {
                updateVideoStatus(vidInfo._id, e.target.value, '');
            }
        });
        // Save Post Operation
        adminSaveVideoResElm.addEventListener("click", function (e) {
            e.preventDefault();
            if (!adminVideoResElm.value) {
                adminVideoResElm.classList.add("is-invalid");
                adminVideoResElm.addEventListener("input", function () {
                    adminVideoResElm.classList.remove("is-invalid");
                });
                return;
            }
            updateVideoStatus(vidInfo._id, "done", adminVideoResElm.value);
        });
        // Delete Operation
        adminDeleteVideoReqElm.addEventListener("click", function (e) {
            e.preventDefault();
            var isSure = confirm("Are you sure you want To delete \"" + vidInfo.topic_title + "\"");
            if (!isSure)
                return;
            fetch("http://localhost:7777/video-request", {
                method: "DELETE",
                headers: { "content-Type": "application/json" },
                body: JSON.stringify({ id: vidInfo._id })
            })
                .then(function (res) { return res.json(); })
                .then(function (data) { return window.location.reload(); });
        });
    }
    // Implementation Of Voting
    applyVoteStyle(vidInfo._id, vidInfo.votes, vidInfo.status === "done", '');
    var scoreVoteElm = document.getElementById("score_vote_" + vidInfo._id);
    var votesElms = document.querySelectorAll("[id^=votes_][id$=_" + vidInfo._id + "]");
    votesElms.forEach(function (elm) {
        if (state.isSuperUser || vidInfo.status === "done") {
            return;
        }
        elm.addEventListener("click", function (e) {
            e.preventDefault();
            var _a = e.target.getAttribute("id").split("_"), vote_type = _a[1], id = _a[2];
            fetch("http://localhost:7777/video-request/vote", {
                method: "PUT",
                headers: { "content-Type": "application/json" },
                body: JSON.stringify({ id: id, vote_type: vote_type, user_id: state.userId })
            })
                .then(function (data) { return data.json(); })
                .then(function (data) {
                scoreVoteElm.innerText = data.ups.length - data.downs.length;
                applyVoteStyle(id, data, vidInfo.status === "done", vote_type);
            });
        });
    });
}
// Implementation Of Voting Default State
function applyVoteStyle(video_id, votes_list, isDisabled, vote_type) {
    var votesUpsElm = document.getElementById("votes_ups_" + video_id);
    var votesDownsElm = document.getElementById("votes_downs_" + video_id);
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
        }
        else if (votes_list.downs.includes(state.userId)) {
            vote_type = "downs";
        }
        else {
            return;
        }
    }
    var voteDirElm = vote_type === "ups" ? votesUpsElm : votesDownsElm;
    var otherDirElm = vote_type === "ups" ? votesDownsElm : votesUpsElm;
    if (votes_list[vote_type].includes(state.userId)) {
        voteDirElm.style.opacity = 1;
        otherDirElm.style.opacity = 0.5;
    }
    else {
        otherDirElm.style.opacity = 1;
    }
}
// Implementation of fetching Posts, Sorting, Searching and Filtering
function loadAllVidReqs(sortBy, searchTerm, filterBy) {
    if (sortBy === void 0) { sortBy = "newFirst"; }
    if (searchTerm === void 0) { searchTerm = ""; }
    if (filterBy === void 0) { filterBy = "all"; }
    fetch("http://localhost:7777/video-request?sortBy=" + sortBy + "&searchTerm=" + searchTerm + "&filterBy=" + filterBy)
        .then(function (data) { return data.json(); })
        .then(function (data) {
        listOfVidsElms.innerHTML = "";
        data.forEach(function (vidInfo) {
            renderSingleVidReq(vidInfo);
        });
    });
}
// Debouncing Implementation
function debounce(fn, time) {
    var timeout;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return fn.apply(_this, args); }, time);
    };
}
// Form Validation
function checkValidity(formData) {
    var topic = formData.get("topic_title");
    var topicDetails = formData.get("topic_details");
    var topicTitle = document.querySelector("[name=topic_title]");
    var textAreaDetails = document.querySelector("[name=topic_details]");
    if (!topic || topic.length > 30) {
        topicTitle.classList.add("is-invalid");
    }
    if (!topicDetails) {
        textAreaDetails.classList.add("is-invalid");
    }
    var allInvalidElms = document
        .getElementById("videoRequestForm")
        .querySelectorAll(".is-invalid");
    if (allInvalidElms.length) {
        allInvalidElms.forEach(function (elm) {
            elm.addEventListener("input", function () {
                this.classList.remove("is-invalid");
            });
        });
        return false;
    }
    return true;
}
// Loading DOM Content
document.addEventListener("DOMContentLoaded", function () {
    var vidReqFormElm = document.getElementById("videoRequestForm");
    var sortByElms = document.querySelectorAll("[id*=sort_by_]");
    var searchBoxElm = document.getElementById("search_box");
    var loginFormElm = document.querySelector(".login-form");
    var contentAppElm = document.querySelector(".content-app");
    var filterByElms = document.querySelectorAll("[id^=filter_by_]");
    var normalUserCOntent = document.querySelector(".normal-user-content");
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
    sortByElms.forEach(function (elm) {
        elm.addEventListener("click", function (e) {
            e.preventDefault();
            var sortByNew = document.getElementById("sort_by_new");
            var sortByTop = document.getElementById("sort_by_top");
            state.sortBy = this.querySelector("input").value;
            loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);
            this.classList.add("active");
            if (state.sortBy === "topVotedFirst") {
                sortByNew.classList.remove("active");
            }
            else {
                sortByTop.classList.remove("active");
            }
        });
    });
    // Implementation Of Filtering
    filterByElms.forEach(function (elm) {
        elm.addEventListener("click", function (e) {
            e.preventDefault();
            state.filterBy = e.target.getAttribute("id").split("_")[2];
            filterByElms.forEach(function (option) { return option.classList.remove('active'); });
            this.classList.add('active');
            loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);
        });
    });
    // Implementation Of Search Capapility
    searchBoxElm.addEventListener("input", debounce(function (e) {
        state.searchTerm = e.target.value;
        loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);
    }, 300));
    // Adding new posts
    vidReqFormElm.addEventListener("submit", function (e) {
        e.preventDefault();
        var formData = new FormData(vidReqFormElm);
        formData.append("author_id", state.userId);
        var isValid = checkValidity(formData);
        if (!isValid)
            return;
        fetch("http://localhost:7777/video-request", {
            method: "POST",
            body: formData
        })
            .then(function (data) { return data.json(); })
            .then(function (data) {
            renderSingleVidReq(data, true);
        });
    });
});
