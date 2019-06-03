const InitialState = {
  my_id: 3,
  turn_id: 1,
  last_turn_id: 6,
  newCard: { value: -1, color: "" },
  middleCard: { value: 1, color: "red", variance: 0 },
  players: [
    { id: 1, name: "bot", cardCount: 7, isAnimating: false },
    { id: 2, name: "bot", cardCount: 7, isAnimating: false },
    { id: 3, name: "brendan", cardCount: 7, isAnimating: false },
    { id: 4, name: "bot", cardCount: 7, isAnimating: false },
    { id: 5, name: "bot", cardCount: 7, isAnimating: false },
    { id: 6, name: "bot", cardCount: 7, isAnimating: false }
  ],
  shiftedPlayers: [],
  hand: [
    { value: 1, color: "green" },
    { value: 2, color: "green" },
    { value: 3, color: "green" },
    { value: 4, color: "green" },
    { value: 5, color: "green" },
    { value: 6, color: "green" },
    { value: 7, color: "green" }
  ]
};

export default InitialState;
