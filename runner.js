export class CYOARunner {
  constructor(representation) {
    this._representation = representation;
    this._isDone = false;

    // This is grabbing the first key in the JSON as the starting passage
    // Could this produce undefined behavior?
    this._currentPassageName = Object.keys(representation.passages)[0];
    this._currentPassage =
      this._representation.passages[this._currentPassageName];

    this._inventory = {};

    this._executeAll(this._representation.initializationScript);
    this._executeAll(this._currentPassage.initializationScript);
  }

  _executeAll(arr) {
    // defining inventory just so eval can use it
    var inventory = this.inventory;
    arr.forEach((statement) => {
      eval(statement);
    });
  }

  // TODO: figure out how to make this a getter
  // without screwing up the hoisting of inventory before eval
  get inventory() {
    return this._inventory;
  }

  get passageText() {
    return this._currentPassage.text;
  }

  get isDone() {
    return this._isDone;
  }

  transition(passageName) {
    this._currentPassageName = passageName;
    this._currentPassage = this._representation.passages[passageName];
    this._executeAll(this._currentPassage.initializationScript);
    if (this._currentPassage.transitions.length == 0) {
      this._isDone = true;
    }
  }

  get transitionOptions() {
    const inventory = this._inventory;

    return this._currentPassage.transitions.map(function (transition) {
      const transitionCopy = { ...transition };
      transitionCopy.isValid = eval(transition.transitionCriteria);
      if (transitionCopy.isValid === null) {
        transitionCopy.isValid = true;
      }
      return transitionCopy;
    });
  }
}
