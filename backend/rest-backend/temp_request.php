<?php
$data=json_encode(["correo"=>"test_resend7@example.com","password"=>"Abcd1234!","nombre"=>"Test","apellido"=>"Resend","edad"=>25]);
$opts=["http"=>["method"=>"POST","header"=>"Content-Type: application/json","content"=>$data,"ignore_errors"=>true],"ssl"=>["verify_peer"=>false,"verify_peer_name"=>false]];
$ctx=stream_context_create($opts);
$response=@file_get_contents("https://127.0.0.1:8000/api/auth/registro", false, $ctx);
echo "HTTP RESPONSE HEADERS:\n";
if (isset($http_response_header)) { echo implode("\n", $http_response_header) . "\n"; }
echo "\nBODY:\n";
echo $response;
