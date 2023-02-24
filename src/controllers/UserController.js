const { validationResult } = require("express-validator");
const UserService = require("../services/UserService");
const ApiError = require("../exceptions/api-error");

class UserController {
  async getInfo(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const user = await UserService.getUserInfo(req.params.id);
      if (!user)
        throw ApiError.BadRequest(`Игрок #${req.params.id} не был найден!`);

      res.json({
        message: `Данные игрока #${req.params.id}:`,
        details: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getProgress(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const user = await UserService.getUserProgress(req.params.id);
      if (!user)
        throw ApiError.BadRequest(`Игрок #${req.params.id} не был найден!`);

      res.json({
        message: `Прогресс игрока #${req.params.id}:`,
        details: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getUserPlayer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { userId, playerId } = req.params;

      const player = await UserService.getUserPlayer(userId, playerId);
      if (!player) throw ApiError.BadRequest(`Игрок #${userId} не был найден!`);

      res.json({
        message: `Футболист #${playerId} игрока #${userId}:`,
        details: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getLeagueMatches(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const leagueMatches = await UserService.getUserCurrentLeagueMatches(
        +req.params.id
      );
      if (!leagueMatches.length)
        throw ApiError.BadRequest(`Игрок #${req.params.id} не существует!`);

      res.json({
        message: `Матчи игрока #${req.params.id}:`,
        details: {
          leagueMatches,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { name, abbr, logo } = req.body;
      const isUpdated = await UserService.updateUserProfile(
        id,
        name,
        abbr,
        logo
      );
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Профиль игрока #${id} обновлен!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async getMoney(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const user = await UserService.getUserMoney(req.params.id);
      if (!user)
        throw ApiError.BadRequest(`Игрок #${req.params.id} не был найден!`);

      res.json({
        message: `Деньги игрока #${req.params.id}:`,
        details: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async updateMoney(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { moneyType, amount } = req.body;
      const isUpdated = await UserService.updateUserMoney(
        id,
        moneyType,
        amount
      );
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Валюта ${moneyType} игрока #${id} обновлена!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateAvatar(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { avatar } = req.body;
      const isUpdated = await UserService.updateUserAvatar(id, avatar);
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Аватар игрока #${id} изменен на #${avatar}!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async updatePlayers(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { playersJson } = req.body;
      const isUpdated = await UserService.updateUserPlayers(id, playersJson);
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Карточки футболистов игрока #${id} обновлены!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async updatePlayer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { playerId, data } = req.body;
      const isUpdated = await UserService.updateUserPlayer(id, playerId, data);
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Футболист игрока #${id} обновлен!`,
        updated: true,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateWaitingPlayers(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { waitingPlayersJson } = req.body;
      const isUpdated = await UserService.updateUserWaitingPlayers(
        id,
        waitingPlayersJson
      );
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Карточки футболистов в списке ожидания игрока #${id} обновлены!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async releasePlayer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id, playerId } = req.params;

      const isUpdated = await UserService.releasePlayer(id, playerId);
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Футболист #${playerId} уволен с команды игрока #${id}!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async hirePlayer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id, waitingId } = req.params;

      const isUpdated = await UserService.hirePlayer(id, waitingId);
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Футболист #${waitingId} добавлен в команду игрока #${id}!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateTempPlayer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { tempPlayer } = req.body;
      const isUpdated = await UserService.updateUserTempPlayer(id, tempPlayer);
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Временная карточка игрока #${id} обновлена!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async checkTempPlayer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const id = req.params.id,
        row = await UserService.checkUserTempPlayer(id);

      if (!row) throw ApiError.BadRequest(`Юзер #${id} не существует!`);
      if (!row.tempPlayer) {
        res.json({
          message: `У юзера #${id} нету временного игрока...`,
        });
        return;
      }

      res.json({
        message: `У юзера #${id} есть временный игрок...`,
        details: {
          tempPlayer: row.tempPlayer,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async updateTempAction(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { tempAction } = req.body;
      const isUpdated = await UserService.updateUserTempAction(id, tempAction);
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Временное действие игрока #${id} обновлено!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async checkTempAction(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const id = req.params.id,
        row = await UserService.checkUserTempAction(id);

      if (!row) throw ApiError.BadRequest(`Юзер #${id} не существует!`);
      if (!row.tempAction) {
        res.json({
          message: `У юзера #${id} не выбрано временное действие...`,
        });
        return;
      }

      res.json({
        message: `У юзера #${id} выбрано временное действие!`,
        details: {
          tempAction: row.tempAction,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async updateTempDialogs(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { tempDialogs } = req.body;

      const isUpdated = await UserService.updateUserTempDialogs(
        id,
        tempDialogs
      );
      if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

      res.json({
        message: `Диалоги игрока #${id} обновлены!`,
      });
    } catch (e) {
      next(e);
    }
  }

  async checkTempDialogs(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const id = req.params.id,
        row = await UserService.checkUserTempDialogs(id);

      if (!row) throw ApiError.BadRequest(`Юзер #${id} не существует!`);
      if (!row.tempDialogs) {
        res.json({
          message: `У юзера #${id} нету временного диалога...`,
        });
        return;
      }

      res.json({
        message: `У юзера #${id} выбран временный диалог!`,
        details: {
          tempDialogs: row.tempDialogs,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getLastPlayedMatch(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const id = +req.params.id,
        lastPlayedMatch = await UserService.getUserLastPlayedMatch(id);

      res.json({
        message: "User last played match:",
        details: {
          lastPlayedMatch,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getClubTalk(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params;
      const clubTalk = await UserService.getClubTalk(id);

      res.json({
        message: "User's club talk:",
        details: {
          place: clubTalk,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async setClubTalk(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params,
        { place } = req.body;
      const isSeted = await UserService.setClubTalk(id, place);

      res.json({
        message: "User's club talk place seted:",
        details: {
          isSeted,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async checkTraining(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const isAvilable = await UserService.checkTraining();

      res.json({
        message: "User`s training:",
        details: {
          isAvilable,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async checkTrainingResults(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params;
      const results = await UserService.checkTrainingResults(id);

      res.json({
        message: "User`s training results:",
        details: {
          results,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async doTraining(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ApiError.BadRequest("Неверные данные!", {
          errors: errors.errors,
        });

      const { id } = req.params;
      const isSeted = await UserService.doTraining(id);

      res.json({
        message: "User's training has been conducted:",
        details: {
          isSeted,
        },
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
