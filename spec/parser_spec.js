import Parser from '../parser';

describe("Parser", () => {
  it("processes incoming command", () => {
    const command = 'GET k';
    const result = Parser.processIncomingString(command);

    expect(result).toEqual({isValid: true, error: "", tokens: ["GET", "k"]});
  });
});
