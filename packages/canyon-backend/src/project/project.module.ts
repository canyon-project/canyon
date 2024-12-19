import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ProjectResolver } from "./project.resolver";
import { ProjectService } from "./services/project.service";
import { GetProjectChartDataService } from "./services/get-project-chart-data.service";
import { GetProjectRecordsService } from "./services/get-project-records.service";
import { GetProjectCompartmentDataService } from "./services/get-project-compartment-data.service";
import { GetProjectRecordDetailByShaService } from "./services/get-project-record-detail-by-sha.service";
// import { GetProjectsCopyService } from './services/get-projects-copy.service';
// import { GetProjectsNoDataService } from "./services/get-projects-no-data.service";
import { GetProjectsService } from "./services/get-projects.service";
import { DeleteProjectRecordService } from "./services/delete-project-record.service";
import { UpdateProjectService } from "./services/crud/update-project.service";
@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [
        ProjectResolver,
        ProjectService,
        GetProjectChartDataService,
        GetProjectRecordsService,
        GetProjectCompartmentDataService,
        GetProjectRecordDetailByShaService,
        GetProjectsService,
        DeleteProjectRecordService,
        UpdateProjectService,
    ],
    exports: [],
})
export class ProjectModule {}
