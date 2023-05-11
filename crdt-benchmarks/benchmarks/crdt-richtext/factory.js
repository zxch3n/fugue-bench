import * as collabs from "@collabs/collabs";
import { RichText, setPanicHook } from "crdt-richtext-wasm";
import seedrandom from "seedrandom";
import { AbstractCrdt, CrdtFactory } from "../../js-lib/index.js"; // eslint-disable-line

export const name = "crdt-richtext";

/**
 * @implements {CrdtFactory}
 */
export class CrdtRichtextFactory {
  constructor() {}

  /**
   * @param {function(Uint8Array):void} [updateHandler]
   */
  create(updateHandler) {
    return new RichTextImpl(updateHandler);
  }

  getName() {
    return name;
  }
}

/**
 * @implements {AbstractCrdt}
 */
export class RichTextImpl {
  /**
   * @param {function(Uint8Array):void} [updateHandler]
   */
  constructor(updateHandler) {
    this.text = new RichText(BigInt(Math.floor((1 << 31) * Math.random())));
    this.version = undefined;
    this.updateHandler = updateHandler;
  }

  update() {
    if (this.updateHandler) {
      this.updateHandler(this.text.export(this.version || new Uint8Array()));
      this.version = this.text.version();
    }
  }

  /**
   * @param {Uint8Array} update
   */
  applyUpdate(update) {
    this.text.import(update);
  }

  /**
   * @return {Uint8Array|string}
   */
  getEncodedState() {
    return this.text.export(new Uint8Array());
  }

  /**
   * Insert several items into the internal shared array implementation.
   *
   * @param {number} index
   * @param {Array<any>} elems
   */
  insertArray(index, elems) {
    throw new Error("not implemented");
  }

  /**
   * Delete several items into the internal shared array implementation.
   *
   * @param {number} index
   * @param {number} len
   */
  deleteArray(index, len) {
    throw new Error("not implemented");
  }

  /**
   * @return {Array<any>}
   */
  getArray() {
    throw new Error("not implemented");
  }

  /**
   * Insert text into the internal shared text implementation.
   *
   * @param {number} index
   * @param {string} text
   */
  insertText(index, text) {
    this.transact(() => this.text.insert(index, text));
  }

  /**
   * Delete text from the internal shared text implementation.
   *
   * @param {number} index
   * @param {number} len
   */
  deleteText(index, len) {
    this.transact(() => this.text.delete(index, len));
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
    f(this);
    this.update()
  }

  free() {
    this.text.free();
  }
}
