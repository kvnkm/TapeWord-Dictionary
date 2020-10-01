export default async function getDefRes(termString: string): Promise<Response> {
  const endPoint: string = `https://www.lexico.com/search?utf8=%E2%9C%93&filter=noad&dictionary=en&s=t&query=${termString}`;
  const defRes: Response = await fetch(endPoint, getFetchHeaders(termString));

  return Promise.resolve(defRes);
}

function getFetchHeaders(term: string) {
  return {
    headers: {
      credentials: "include",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Upgrade-Insecure-Requests": "1",
      referrer: `https://www.lexico.com/en/definition/${term}`,
      method: "GET",
      mode: "cors",
    },
  };
}
