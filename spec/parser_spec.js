import Parser from '../parser';

describe("Parser", () => {
  it("processes incoming get command", () => {
    const command = '*2\r\n$3\r\nGET\r\n$1\r\nk\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(["GET", "k"]);
  });

  it("processes incoming set command", () => {
    const command = '*3\r\n$3\r\nSET\r\n$1\r\nk\r\n$5\r\n10000\r\n';
    const result = Parser.convertRespStringToTokens(command);

    expect(result).toEqual(["SET", "k", "10000"]);
  });
});
