// import { DataSource, EntityManager, QueryRunner } from 'typeorm';

// export class TransactionManagerService {
//   private static instance: TransactionManagerService;
//   private dataSource: DataSource;
//   private queryRunner: QueryRunner;
//   private entityManager: EntityManager;
//   private active: boolean = false;

//   private constructor(dataSource: DataSource) {
//     this.dataSource = dataSource;
//   }

//   /**
//    * Get the singleton instance of TransactionManagerService
//    */
//   public static getInstance(
//     dataSource?: DataSource,
//   ): TransactionManagerService {
//     if (!TransactionManagerService.instance) {
//       if (!dataSource) {
//         throw new Error(
//           'DataSource must be provided when creating TransactionManagerService',
//         );
//       }
//       TransactionManagerService.instance = new TransactionManagerService(
//         dataSource,
//       );
//     }
//     return TransactionManagerService.instance;
//   }

//   /**
//    * Start a transaction for test isolation
//    */
//   async startTransaction(): Promise<EntityManager> {
//     if (this.active) {
//       console.warn(
//         '⚠️ Transaction already active - rolling back current before starting new',
//       );
//       await this.rollbackTransaction();
//     }

//     // Create a new query runner for this test
//     this.queryRunner = this.dataSource.createQueryRunner();

//     // Start transaction
//     await this.queryRunner.connect();
//     await this.queryRunner.startTransaction();
//     this.active = true;

//     // Get the transaction entity manager
//     this.entityManager = this.queryRunner.manager;

//     console.log('🔄 Started transaction for test isolation');
//     return this.entityManager;
//   }

//   /**
//    * Roll back the transaction after test completion
//    */
//   async rollbackTransaction(): Promise<void> {
//     if (!this.queryRunner || !this.active) {
//       console.warn('⚠️ No active transaction to roll back');
//       return;
//     }

//     try {
//       await this.queryRunner.rollbackTransaction();
//       await this.queryRunner.release();
//       this.active = false;

//       // Clear references
//       this.queryRunner = null;
//       this.entityManager = null;

//       console.log('✅ Rolled back transaction');
//     } catch (error) {
//       console.error('❌ Failed to roll back transaction:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get the entity manager for the current transaction
//    */
//   getEntityManager(): EntityManager {
//     if (!this.entityManager || !this.active) {
//       throw new Error(
//         'Transaction not started or no longer active. Call startTransaction() first',
//       );
//     }
//     return this.entityManager;
//   }

//   /**
//    * Check if a transaction is in progress
//    */
//   isTransactionActive(): boolean {
//     return (
//       this.active && !!this.queryRunner && this.queryRunner.isTransactionActive
//     );
//   }

//   /**
//    * Reset the instance (mainly for testing)
//    */
//   static resetInstance(): void {
//     TransactionManagerService.instance = null;
//   }
// }
