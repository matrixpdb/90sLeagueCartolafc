<?php

    $cURL = curl_init('https://api.cartolafc.globo.com/atletas/mercado');
     curl_setopt($cURL, CURLOPT_RETURNTRANSFER, true);
    // Executa a consulta, conectando-se ao site e salvando o resultado na variável $resultado
    $resultado = curl_exec($cURL);
    // Encerra a conexão com o site

    echo $resultado;

