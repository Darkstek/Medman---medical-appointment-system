"use strict";
const { UseCaseContext } = require("uu_appg01_server").AppServer;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { UuTerrClient } = require("uu_territory_clientg01");

const TerritoryConstants = require("../constants/territory-constants");
const DtoBuilder = require("./dto-builder");
const { MedmanMain: Errors } = require("../api/errors/medman-main-error");
const Warnings = require("../api/warnings/medman-main-warning");
const MedmanMainConstants = require("../constants/medman-main-constants");

class MedmanMainClient {
  constructor(team1Medman, territoryUri = null, session = null) {
    this.dao = DaoFactory.getDao(MedmanMainConstants.Schemas.MEDMAN_INSTANCE);
    this.team1Medman = team1Medman;
    this.uri = UseCaseContext.getUri();
    this.territoryUri = territoryUri ? territoryUri : team1Medman.uuTerritoryBaseUri;
    this.session = session ? session : UseCaseContext.getSession();
  }

  async createAwsc(location, responsibleRole, permissionMatrix, uuAppMetaModelVersion) {
    const appClientOpts = this.getAppClientOpts();
    const { name, desc } = this.team1Medman;
    const awscCreateDtoIn = {
      name,
      desc,
      code: `${MedmanMainConstants.AWSC_PREFIX}/${this.team1Medman.awid}`,
      location,
      responsibleRole,
      permissionMatrix,
      typeCode: MedmanMainConstants.UUAPP_CODE,
      uuAppWorkspaceUri: this.uri.getBaseUri(),
      uuAppMetaModelVersion,
    };

    let awsc;
    try {
      awsc = await UuTerrClient.Awsc.create(awscCreateDtoIn, appClientOpts);
    } catch (e) {
      const awscCreateErrorMap = (e.dtoOut && e.dtoOut.uuAppErrorMap) || {};

      const isDup =
        awscCreateErrorMap[TerritoryConstants.AWSC_CREATE_FAILED_CODE] &&
        awscCreateErrorMap[TerritoryConstants.AWSC_CREATE_FAILED_CODE].cause &&
        awscCreateErrorMap[TerritoryConstants.AWSC_CREATE_FAILED_CODE].cause[TerritoryConstants.NOT_UNIQUE_ID_CODE];

      if (isDup) {
        DtoBuilder.addWarning(new Warnings.Init.UuAwscAlreadyCreated());
        awsc = await UuTerrClient.Awsc.get(
          { code: `${MedmanMainConstants.AWSC_PREFIX}/${this.team1Medman.awid}` },
          appClientOpts,
        );
      } else {
        DtoBuilder.addUuAppErrorMap(awscCreateErrorMap);
        throw new Errors.CreateAwscFailed(
          { uuTerritoryBaseUri: this.team1Medman.uuTerritoryBaseUri, awid: this.team1Medman.awid },
          e,
        );
      }
    }

    this.team1Medman = await this.dao.updateByAwid({
      awid: this.team1Medman.awid,
      artifactId: awsc.id,
    });

    return this.team1Medman;
  }

  async loadAwsc() {
    const appClientOpts = this.getAppClientOpts();

    let awsc;
    try {
      awsc = await UuTerrClient.Awsc.load({ id: this.team1Medman.artifactId }, appClientOpts);
    } catch (e) {
      throw new Errors.LoadAwscFailed({ artifactId: this.team1Medman.artifactId }, e);
    }

    return awsc;
  }

  async setAwscState(state) {
    const appClientOpts = this.getAppClientOpts();
    try {
      await UuTerrClient.Awsc.setState(
        {
          id: this.team1Medman.artifactId,
          state,
        },
        appClientOpts,
      );
    } catch (e) {
      throw new Errors.SetAwscStateFailed({ state, id: this.team1Medman.artifactId }, e);
    }
  }

  async deleteAwsc() {
    const appClientOpts = this.getAppClientOpts();
    try {
      await UuTerrClient.Awsc.delete({ id: this.team1Medman.artifactId }, appClientOpts);
    } catch (e) {
      if (e.cause?.code !== TerritoryConstants.ARTIFACT_DOES_NOT_EXIST) {
        throw new Errors.DeleteAwscFailed({ id: this.team1Medman.artifactId }, e);
      }
    }
  }

  getAppClientOpts() {
    return { baseUri: this.territoryUri, session: this.session, appUri: this.uri };
  }
}

module.exports = MedmanMainClient;
