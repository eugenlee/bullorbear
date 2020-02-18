const postsPerRequest = 100;
const maxPostsToFetch = 500;
const maxRequests = maxPostsToFetch/postsPerRequest;

const responses = [];
const threads = [];
var pos = 0;
var neg = 0;

var rdate;
const bull = ["call", "buy","print"];
const bear = ["put", "sell","short"];

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

    allPosts.forEach(({ data: { title, url }}) => {
        if (title.includes(`Daily Discussion Thread - ${rdate}`)) {
            theUrl = `${url}.json?limit=${postsPerRequest}`;
        }
    })

    const thread = await fetch(theUrl);
    const threadJSON = await thread.json();
    threads.push(threadJSON);

    threads.forEach(thread => {
        allComments.push(...thread['1'].data.children);
    })

    allComments.forEach(({ data: {body} }) => {
        if (body != undefined) {
            var s = body.toLowerCase();
            for (var i = 0; i<bull.length; i++) {
                if (s.includes(bull[i])) pos++;
                else if (s.includes(bear[i])) neg++;
            }
        }
    })
    var sum = pos/(pos+neg) * 100;
    if (sum >= 50) alert("You're bullish: " + sum);
    else ("You're bearish: " + sum);
}

// parse more comments
// next up fix the pos + neg so that it resets and doesn't keep adding to previous value
// jquery animation

const subredditSelectForm = document.getElementById('search');
subredditSelectForm.addEventListener('submit', handleSubmit);