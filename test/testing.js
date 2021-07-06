import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiHTML from 'chai-html';
import chaiDOM from 'chai-dom';

chai.use(sinonChai);
chai.use(chaiHTML);
chai.use(chaiDOM);

export { expect };
