export default function Page() {
  return (
    <div>
      <iframe
        style={{
          height: "calc(100vh - 65px)",
          width: "100%",
        }}
        srcDoc={`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
<redoc spec-url="https://app.canyonjs.org/swagger/json"></redoc>
<script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
</body>
</html>
`}
        allowFullScreen
      ></iframe>
    </div>
  );
}
