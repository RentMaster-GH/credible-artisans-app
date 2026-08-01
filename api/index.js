module.exports = (req, res) => {
  res.writeHead(307, {
    Location: 'https://credible-artisans-app-zkl9jigjz3aqeupvjc8vhn.streamlit.app' + req.url,
  });
  res.end();
};