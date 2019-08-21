
import { Rank } from './lexorank';

it('', () => {
    expect(Rank("", "b")).toEqual({ rank: "5", rebalance: false })
    expect(Rank("a", "")).toEqual({ rank: "m", rebalance: false })
    expect(Rank("a", "b")).toEqual({ rank: "ah", rebalance: false })
    expect(Rank("aa", "aa1")).toEqual({ rank: "aa0h", rebalance: false })
    expect(Rank("aa", "aa0")).toEqual({ rank: "aa", rebalance: true })
});


