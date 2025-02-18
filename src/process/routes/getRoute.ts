import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";

export default class GetRouteProcess extends BaseProcess {
  constructor() {
    super("get-route");
  }

  override async invoke(routeName: string) {
    const route = await Databases.RouteCollection.findOne({
      routeid: routeName.toLowerCase().replaceAll(" ", ""),
    });


    return route;
  }
}
