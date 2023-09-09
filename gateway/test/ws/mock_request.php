<?php

$headerArray =array(
    'Content-Type: application/json',
    'Content-Language:en-US'
);

//$url="http://localhost:3333/direct";      //Hub URL
$url="http://localhost:3333/server";      //Hub URL
$num=100;

$start=time();
echo $url.'<br>';
echo "Start at:".$start.', requests: '.$num."<br/>";

for($i=0;$i<$num;$i++){
    $curl = curl_init();
    curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,FALSE);
    curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,FALSE);
    curl_setopt($curl,CURLOPT_URL,$url);
    curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($curl,CURLOPT_HTTPHEADER,$headerArray);
    curl_setopt($curl,CURLOPT_POST,1);

    $data=array(
        "index" =>  $i,
        "stamp" =>  time(),
    );
    $json=json_encode($data);
    echo "Req:".$json."<br>";

    curl_setopt($curl,CURLOPT_POSTFIELDS,$json);
    $output = curl_exec($curl);	
    echo "Res:".$output."<br>";
    curl_close($curl);
}

$end=time();
echo "End at:".$end.", cost:".($end-$start);