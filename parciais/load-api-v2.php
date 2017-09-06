<?php
  /* Cartrolando FC - http://cartrolandofc.cf
   * https://github.com/wgenial/cartrolandofc
   * Desenvolvido por WGenial - http://wgenial.com.br
   * License: MIT <http://opensource.org/licenses/mit-license.php> - see LICENSE file
   */

  header('Content-type: application/json;charset=UTF-8');
  
  if (isset($_GET["api"]) and $_GET["api"] !== "") {
    if ($_GET["api"] === "busca-time") {
      $url = "https://api.cartolafc.globo.com/times?q=". rawurlencode($_GET["team"]);
    } else if ($_GET["api"] === "busca-atletas") {
      $url = "https://api.cartolafc.globo.com/time/slug/". $_GET["team_slug"];
    } else if ($_GET["api"] === "parciais-atletas") {
      $url = "https://api.cartolafc.globo.com/atletas/pontuados";
    } else if ($_GET["api"] === "mercado-status") {
      $url = "https://api.cartolafc.globo.com/mercado/status";
    } else if ($_GET["api"] === "atletas-mercado") {
      $url = "https://api.cartolafc.globo.com/atletas/mercado";
    } else if ($_GET["api"] === "clubes") {
      $url = "https://api.cartolafc.globo.com/clubes";
    } else if ($_GET["api"] === "partidas") {
      $url = "https://api.cartolafc.globo.com/partidas/". $_GET["rodada"];
    }
  
    $c = curl_init();
    curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($c, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; rv:53.0) Gecko/20100101 Firefox/53.0");
    curl_setopt($c, CURLOPT_URL, $url);
    $result = curl_exec($c);
    curl_close($c);
    
    if($result == "") {
      echo 'null';
    } else {
      echo $result;
    }   
  }
?>