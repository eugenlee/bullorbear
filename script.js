const postsPerRequest = 100;
const maxPostsToFetch = 500;
const maxRequests = maxPostsToFetch/postsPerRequest;

var responses = [];
var threads = [];

var rdate;
const bull = ["calls","buy","print","pump","bull"];
const bear = ["puts","sell","short","shit","bear"];

const handleSubmit = e => {
    e.preventDefault();
    const subdate = document.getElementById('subdate').value;
    if (subdate.length == 0) alert('Please enter a date.')
    rdate = subdate;
    fetchPosts(subdate);
}

const fetchPosts = async (subdate, afterParam) => {
    const response = await fetch(`https://www.reddit.com/r/wallstreetbets.json?limit=${postsPerRequest}
    ${afterParam ? '&after=' + afterParam : ''}`)

    const responseJSON = await response.json();
    responses.push(responseJSON);

    if (responseJSON.data.after && responses.length < maxRequests) {
        fetchPosts(subdate, responseJSON.data.after);
        return;
    }
    comments(responses);
}

const comments = async response => {
    const allPosts = [];
    const allComments = [];
    var theUrl;

    responses.forEach(response => {
        allPosts.push(...response.data.children);
    })
    responses = [];
    var type = document.getElementById('drop').value;
    allPosts.forEach(({ data: { title, url }}) => {
        if (title.includes(`${type} ${rdate}`)) {
            theUrl = `${url}.json?limit=500`;
        }
    })

    if (theUrl == undefined) alert('Date too far, please enter a closer market day');

    const thread = await fetch(theUrl);
    const threadJSON = await thread.json();
    threads.push(threadJSON);

    threads.forEach(thread => {
        allComments.push(...thread['1'].data.children);
    })
    threads = [];
    var pos = 0;
    var neg = 0;
    var anotherURL;
    var link_id = allComments[0].data.link_id;
    allComments.forEach(({ data: { body, children }}) => {
        if (body != undefined) {
            var s = body.toLowerCase();
            for (var i = 0; i<bull.length; i++) {
                if (s.includes(bull[i])) pos++;
                else if (s.includes(bear[i])) neg++;
            }
        }
        /*else if (children != undefined) {
            anotherURL = `http://api.reddit.com/api/morechildren?api_type=json&children=${children.join("%")}&link_id=${link_id}&limit=500`;
        }*/
    })

    /*const thread2JSON = await anotherURL.json();
    console.log(thread2JSON);*/

    var sum = pos/(pos+neg) * 100;
    var f = Math.floor(sum);
    var deg = Math.floor( (sum/100) * 180 )

    if (sum >= 50) alert("You're bullish: " + sum);
    else alert("You're bearish: " + sum);

    var tmp= document.getElementById('percent');
    tmp.textContent = f;

    document.documentElement.style.setProperty('--perc', deg);
}

// parse more comments
// jquery animation

const subredditSelectForm = document.getElementById('search');
subredditSelectForm.addEventListener('submit', handleSubmit);