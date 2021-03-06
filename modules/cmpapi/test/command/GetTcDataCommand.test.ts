import {GetTCDataCommand} from '../../src/command/GetTCDataCommand';
import {TCDataCallback} from '../../src/callback';
import {CmpApiModel} from '../../src/CmpApiModel';
import {GVLFactory, TCModelFactory, TCStringFactory, XMLHttpTestTools} from '@iabtcf/testing';
import {TCData} from '../../src/response/TCData';
import {expect} from 'chai';

describe('command->GetTCDataCommand', (): void => {

  it('should return a TCData object when called', (done: () => void): void => {

    CmpApiModel.tcModel = TCModelFactory.withGVL();

    const tcDataCallback: TCDataCallback = (tcData: TCData, success: boolean): void => {

      expect(success, 'success').to.be.true;
      expect(tcData instanceof TCData, 'tcData instanceof TCData').to.be.true;

      done();

    };

    new GetTCDataCommand(tcDataCallback);

  });

  it('should return a TCData object and get a GVL if one is not passed with the tcModel', (done: () => void): void => {

    CmpApiModel.tcModel = TCModelFactory.noGVL();
    const json = GVLFactory.getVersion(+CmpApiModel.tcModel.vendorListVersion).getJson();

    const tcDataCallback: TCDataCallback = (tcData: TCData, success: boolean): void => {

      expect(success, 'success').to.be.true;
      expect(tcData instanceof TCData, 'tcData instanceof TCData').to.be.true;

      done();

    };

    new GetTCDataCommand(tcDataCallback);

    expect(XMLHttpTestTools.requests.length, 'XMLHttpTestTools.requests.length').to.equal(1);

    const req: sinon.SinonFakeXMLHttpRequest = XMLHttpTestTools.requests[0];
    req.respond(200, XMLHttpTestTools.JSON_HEADER, JSON.stringify(json));

  });

  it('should return a TCData object and should not get a GVL if a tcString is set instead of tcModel', (done: () => void): void => {

    CmpApiModel.tcString = TCStringFactory.base();

    const tcDataCallback: TCDataCallback = (tcData: TCData, success: boolean): void => {

      expect(success, 'success').to.be.true;
      expect(tcData instanceof TCData, 'tcData instanceof TCData').to.be.true;
      expect(tcData.tcString, 'tcString').to.equal(CmpApiModel.tcString);

      done();

    };

    new GetTCDataCommand(tcDataCallback);

    expect(XMLHttpTestTools.requests.length, 'XMLHttpTestTools.requests.length').to.equal(0);

  });

  it('should return a TCData object with a subset of vendors if a list of ids are passed', (done: () => void): void => {

    const vendors = [16, 18];
    CmpApiModel.tcModel = TCModelFactory.withGVL();

    new GetTCDataCommand((tcData: TCData, success: boolean): void => {

      expect(success, 'success').to.be.true;
      expect(tcData instanceof TCData, 'tcData instanceof TCData').to.be.true;

      expect(Object.keys(tcData.vendor.consents), 'tcData.vendor.consents').to.have.lengthOf(vendors.length);
      vendors.forEach((vendorId: number): void => {

        expect(tcData.vendor.consents, 'tcData.vendor.consents').to.have.property(vendorId.toString());

      });

      done();

    }, vendors);

  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runFailWithParam = (badParam: any): void => {

    it(`should return result=null and success=false for param=${badParam}`, (done: () => void): void => {

      new GetTCDataCommand((result: null, success: boolean): void => {

        expect(result, 'result').to.be.null;
        expect(success, 'success').to.be.false;
        done();

      }, badParam);

    });

  };

  runFailWithParam(null);
  runFailWithParam({});
  runFailWithParam('banana');
  runFailWithParam(['banana', 'apple', 'cake']);
  runFailWithParam(1);
  runFailWithParam(true);
  runFailWithParam(false);
  runFailWithParam(0);
  runFailWithParam(1.1);
  runFailWithParam([1.7, 1.34]);

});
