import { AbstractCrdt, CrdtFactory } from "../../js-lib/index.js"; // eslint-disable-line
import { Loro, LoroList, LoroMap, LoroText, setPanicHook } from "loro-crdt";
import { readFileSync } from "fs";
import path from "path";

export const name = "loro-wasm";

/**
 * @implements {CrdtFactory}
 */
export class LoroFactory {
  /**
   * @param {function(Uint8Array):void} [updateHandler]
   */
  create(updateHandler) {
    return new LoroWasm(updateHandler);
  }

  getName() {
    return name;
  }
}

/**
 * @implements {AbstractCrdt}
 */
export class LoroWasm {
  /**
   * @param {function(Uint8Array):void} [updateHandler]
   */
  constructor(updateHandler) {
    this.doc = new Loro();
    this.version = undefined;
    this.updateHandler = updateHandler;
    this.list = this.doc.getList("list");
    this.map = this.doc.getMap("map");
    this.text = this.doc.getText("text");
    this.inTransact = false;
    this.cachedUpdates = [];
  }

  update() {
    if (this.updateHandler) {
      this.updateHandler(this.doc.exportFrom(this.version));
      this.version = this.doc.version();
    }
  }

  /**
   * @return {Uint8Array|string}
   */
  getEncodedState() {
    return this.doc.exportSnapshot();
  }

  /**
   * @param {Uint8Array} update
   */
  applyUpdate(update) {
    if (this.inTransact) {
      this.cachedUpdates.push(update);
    } else {
      this.doc.import(update);
    }
  }

  /**
   * Insert several items into the internal shared array implementation.
   *
   * @param {number} index
   * @param {Array<any>} elems
   */
  insertArray(index, elems) {
    for (let i = 0; i < elems.length; i++) {
      this.list.insert(this.doc, index + i, elems[i]);
    }
    this.update();
  }

  /**
   * Delete several items into the internal shared array implementation.
   *
   * @param {number} index
   * @param {number} len
   */
  deleteArray(index, len) {
    this.list.delete(this.doc, index, len);
    this.update();
  }

  /**
   * @return {Array<any>}
   */
  getArray() {
    return this.list.value;
  }

  /**
   * Insert text into the internal shared text implementation.
   *
   * @param {number} index
   * @param {string} text
   */
  insertText(index, text) {
    this.text.insert(this.doc, index, text);
    this.update();
  }

  /**
   * Delete text from the internal shared text implementation.
   *
   * @param {number} index
   * @param {number} len
   */
  deleteText(index, len) {
    if (len === 0) {
      return;
    }
    this.text.delete(this.doc, index, len);
    this.update();
  }

  /**
   * @return {string}
   */
  getText() {
    return this.text.toString();
  }

  /**
   * @param {function (AbstractCrdt): void} f
   */
  transact(f) {
    this.cachedUpdates.length = 0;
    this.inTransact = true;
    try {
      f(this);
    } finally {
      this.inTransact = false;
      if (this.cachedUpdates) {
        this.doc.importUpdateBatch(this.cachedUpdates);
        this.cachedUpdates = [];
      }
    }
  }

  /**
   * @param {string} key
   * @param {any} val
   */
  setMap(key, val) {
    this.map.set(this.doc, key, val);
    this.update();
  }

  /**
   * @return {Map<string,any> | Object<string, any>}
   */
  getMap() {
    return this.map.value;
  }

  free() {
    this.doc.free();
  }
}
